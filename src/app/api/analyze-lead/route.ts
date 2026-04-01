import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const groqApiKey = process.env.GROQ_API_KEY!;

export async function POST(request: Request) {
  try {
    const { leadId } = await request.json();

    if (!leadId) {
      return NextResponse.json(
        { error: "leadId is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: lead, error: fetchError } = await supabase
      .from("leads")
      .select("id, name, category, website")
      .eq("id", leadId)
      .single();

    if (fetchError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const systemPrompt = `You are a world-class sales expert. Analyze this business: ${lead.name}${lead.category ? ` (${lead.category})` : ""}${lead.website ? ` - Website: ${lead.website}` : ""}.

Generate 3 highly likely operational pain points for this specific type of business. Give them a lead score from 1-100. Finally, write a short, friendly, personalized cold email to the owner offering to build them an "Immersive 3D Virtual Tour" to solve those pain points.

Return ONLY a valid JSON object with exactly these keys: pain_points (array of strings), lead_score (number), and email_draft (string).`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
      ],
      model: "llama3-8b-8192",
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1024,
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";

    let parsed: { pain_points?: string[]; lead_score?: number; email_draft?: string };
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      return NextResponse.json(
        { error: "AI returned invalid JSON. Please try again." },
        { status: 500 }
      );
    }

    if (!parsed.pain_points || !parsed.lead_score || !parsed.email_draft) {
      return NextResponse.json(
        { error: "AI response was incomplete. Please try again." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("leads")
      .update({ ai_analysis: rawContent })
      .eq("id", leadId);

    if (updateError) {
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pain_points: parsed.pain_points,
      lead_score: parsed.lead_score,
      email_draft: parsed.email_draft,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `AI analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
