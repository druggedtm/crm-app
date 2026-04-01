import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface SocialLinks {
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export async function POST(request: Request) {
  try {
    const { website, leadId } = await request.json();

    if (!website || !leadId) {
      return NextResponse.json(
        { error: "website and leadId are required" },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let html: string;
    try {
      const res = await fetch(website, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return NextResponse.json(
          { error: `Failed to fetch website: HTTP ${res.status}` },
          { status: 502 }
        );
      }

      html = await res.text();
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
        return NextResponse.json(
          { error: "Website request timed out" },
          { status: 504 }
        );
      }
      const msg =
        fetchErr instanceof Error ? fetchErr.message : "Fetch failed";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const $ = cheerio.load(html);

    const emails = new Set<string>();

    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const email = href.replace("mailto:", "").split("?")[0].trim();
        if (email) emails.add(email);
      }
    });

    const text = $("body").text();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const textMatches = text.match(emailRegex);
    if (textMatches) {
      for (const m of textMatches) {
        const lower = m.toLowerCase();
        if (
          !lower.endsWith(".png") &&
          !lower.endsWith(".jpg") &&
          !lower.endsWith(".svg") &&
          !lower.endsWith(".gif") &&
          !lower.endsWith(".webp")
        ) {
          emails.add(m);
        }
      }
    }

    const socialLinks: SocialLinks = {};

    $('a[href]').each((_, el) => {
      const href = ($(el).attr("href") || "").toLowerCase();
      if (href.includes("linkedin.com") && !socialLinks.linkedin) {
        socialLinks.linkedin = $(el).attr("href") || undefined;
      }
      if (
        (href.includes("facebook.com") || href.includes("fb.com")) &&
        !socialLinks.facebook
      ) {
        socialLinks.facebook = $(el).attr("href") || undefined;
      }
      if (href.includes("instagram.com") && !socialLinks.instagram) {
        socialLinks.instagram = $(el).attr("href") || undefined;
      }
      if (
        (href.includes("twitter.com") || href.includes("x.com")) &&
        !socialLinks.twitter
      ) {
        socialLinks.twitter = $(el).attr("href") || undefined;
      }
    });

    const extractedEmail = emails.size > 0 ? Array.from(emails)[0] : null;
    const hasSocials = Object.keys(socialLinks).length > 0;

    const updateData: Record<string, unknown> = {};
    if (extractedEmail) updateData.email = extractedEmail;
    if (hasSocials) updateData.social_links = socialLinks;

    if (Object.keys(updateData).length > 0) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { error: updateError } = await supabase
        .from("leads")
        .update(updateData)
        .eq("id", leadId);

      if (updateError) {
        return NextResponse.json(
          { error: `Database update failed: ${updateError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      email: extractedEmail,
      social_links: hasSocials ? socialLinks : null,
      emails_found: Array.from(emails),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
