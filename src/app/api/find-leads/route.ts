import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

export async function POST(request: Request) {
  try {
    const { city, keyword } = await request.json();

    if (!city || !keyword) {
      return NextResponse.json(
        { error: "City and keyword are required" },
        { status: 400 }
      );
    }

    const sanitizedCity = city.replace(/['"]/g, "").trim();
    const sanitizedKeyword = keyword.replace(/['"]/g, "").trim();

    const overpassQuery = `[out:json][timeout:25];
area["name"="${sanitizedCity}"]["boundary"="administrative"]->.searchArea;
(
  node["amenity"~"${sanitizedKeyword}",i](area.searchArea);
  node["shop"~"${sanitizedKeyword}",i](area.searchArea);
  node["office"~"${sanitizedKeyword}",i](area.searchArea);
  node["tourism"~"${sanitizedKeyword}",i](area.searchArea);
  node["healthcare"~"${sanitizedKeyword}",i](area.searchArea);
  node["name"~"${sanitizedKeyword}",i](area.searchArea);
);
out body;
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let overpassResponse: Response;
    try {
      overpassResponse = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: `data=${encodeURIComponent(overpassQuery)}`,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          signal: controller.signal,
        }
      );
    } catch (fetchErr: unknown) {
      clearTimeout(timeout);
      if (fetchErr instanceof DOMException && fetchErr.name === "AbortError") {
        return NextResponse.json(
          { error: "OpenStreetMap server is currently busy. Please try again in a minute." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { error: "OpenStreetMap server is currently busy. Please try again in a minute." },
        { status: 503 }
      );
    }

    clearTimeout(timeout);

    const contentType = overpassResponse.headers.get("content-type") || "";

    if (!overpassResponse.ok || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "OpenStreetMap server is currently busy. Please try again in a minute." },
        { status: 503 }
      );
    }

    let overpassData: { elements?: OverpassElement[] };
    try {
      overpassData = await overpassResponse.json();
    } catch {
      return NextResponse.json(
        { error: "OpenStreetMap server is currently busy. Please try again in a minute." },
        { status: 503 }
      );
    }

    const elements: OverpassElement[] = overpassData.elements || [];

    const leads = elements
      .filter((el) => el.lat && el.lon && el.tags)
      .map((el) => {
        const tags = el.tags!;
        return {
          name:
            tags["name"] ||
            tags["brand"] ||
            `${sanitizedKeyword} (Unknown)`,
          category:
            tags["amenity"] ||
            tags["shop"] ||
            tags["office"] ||
            tags["tourism"] ||
            tags["healthcare"] ||
            null,
          address: [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:city"],
            tags["addr:postcode"],
          ]
            .filter(Boolean)
            .join(" ") || null,
          lat: el.lat!,
          lng: el.lon!,
          website: tags["website"] || tags["contact:website"] || null,
          email: tags["email"] || tags["contact:email"] || null,
          phone:
            tags["phone"] ||
            tags["contact:phone"] ||
            tags["telephone"] ||
            null,
          ai_analysis: null,
        };
      });

    if (leads.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: `No results found for "${keyword}" in ${city}. Try a broader keyword.`,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: insertError } = await supabase
      .from("leads")
      .insert(leads);

    if (insertError) {
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: leads.length,
      message: `Successfully saved ${leads.length} leads!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
