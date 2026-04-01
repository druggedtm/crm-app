"use client";

import { useState, useCallback } from "react";
import type { Lead, SocialLinks } from "@/lib/types";
import toast from "react-hot-toast";

interface AiAnalysis {
  pain_points: string[];
  lead_score: number;
  email_draft: string;
}

function parseAiAnalysis(raw: string | null): AiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.pain_points && parsed.lead_score && parsed.email_draft) {
      return parsed;
    }
  } catch {
    // not valid JSON, ignore
  }
  return null;
}

export default function LeadsTable({ leads: initialLeads }: { leads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleUpdate = useCallback(
    (leadId: string, updates: Partial<Lead>) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
      );
    },
    []
  );

  const filtered = leads.filter((lead) =>
    [lead.name, lead.category, lead.email, lead.address, lead.phone]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search leads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 md:w-80"
      />
      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-600">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium text-zinc-600 hidden lg:table-cell">Address</th>
              <th className="px-4 py-3 font-medium text-zinc-600 hidden md:table-cell">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-600 hidden lg:table-cell">Phone</th>
              <th className="px-4 py-3 font-medium text-zinc-600 hidden xl:table-cell">Website</th>
              <th className="px-4 py-3 font-medium text-zinc-600 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-500">
                  {leads.length === 0
                    ? "No leads yet. Add data to your Supabase leads table to see it here."
                    : "No leads match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  expanded={expandedRow === lead.id}
                  onToggle={() =>
                    setExpandedRow(expandedRow === lead.id ? null : lead.id)
                  }
                  onUpdate={handleUpdate}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LeadRow({
  lead,
  expanded,
  onToggle,
  onUpdate,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}) {
  const parsed = parseAiAnalysis(lead.ai_analysis);

  return (
    <>
      <tr className="hover:bg-zinc-50 transition-colors">
        <td className="px-4 py-3 font-medium text-zinc-900">{lead.name}</td>
        <td className="px-4 py-3 text-zinc-600 hidden md:table-cell">
          {lead.category ? (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {lead.category}
            </span>
          ) : (
            <span className="text-zinc-400">--</span>
          )}
        </td>
        <td className="px-4 py-3 text-zinc-600 hidden lg:table-cell max-w-[200px] truncate">
          {lead.address ?? <span className="text-zinc-400">--</span>}
        </td>
        <td className="px-4 py-3 text-zinc-600 hidden md:table-cell">
          {lead.email ?? <span className="text-zinc-400">--</span>}
        </td>
        <td className="px-4 py-3 text-zinc-600 hidden lg:table-cell">
          {lead.phone ?? <span className="text-zinc-400">--</span>}
        </td>
        <td className="px-4 py-3 text-zinc-600 hidden xl:table-cell">
          {lead.website ? (
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[180px]">
              {lead.website}
            </a>
          ) : (
            <span className="text-zinc-400">--</span>
          )}
        </td>
        <td className="px-4 py-3">
          <button onClick={onToggle} className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" aria-label="Expand row">
            <svg className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} className="bg-zinc-50 px-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Detail label="Email" value={lead.email} />
              <Detail label="Phone" value={lead.phone} />
              <Detail label="Website" value={lead.website} isLink />
              <Detail label="Address" value={lead.address} />
              <Detail label="Lat" value={lead.lat?.toString()} />
              <Detail label="Lng" value={lead.lng?.toString()} />
              <Detail label="Category" value={lead.category} />
              <SocialLinksDisplay socials={lead.social_links} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {lead.website && !lead.email && (
                <ScrapeButton leadId={lead.id} website={lead.website} onUpdate={onUpdate} />
              )}
              <AiButton leadId={lead.id} onUpdate={onUpdate} hasAnalysis={!!lead.ai_analysis} />
            </div>

            {parsed && <AiResults analysis={parsed} lead={lead} />}
          </td>
        </tr>
      )}
    </>
  );
}

function ScrapeButton({
  leadId,
  website,
  onUpdate,
}: {
  leadId: string;
  website: string;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleScrape() {
    setLoading(true);
    try {
      const res = await fetch("/api/scrape-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website, leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Scrape failed");
      } else if (!data.email && !data.social_links) {
        toast("No contact info found on this website", { icon: "info" });
      } else {
        const updates: Partial<Lead> = {};
        if (data.email) updates.email = data.email;
        if (data.social_links) updates.social_links = data.social_links;
        onUpdate(leadId, updates);
        toast.success(data.message || "Scrape complete!");
      }
    } catch {
      toast.error("Network error. Could not reach scraper.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleScrape} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50">
      {loading ? <Spinner /> : <GlobeIcon />}
      {loading ? "Scraping..." : "Scrape Contact Info"}
    </button>
  );
}

function AiButton({
  leadId,
  onUpdate,
  hasAnalysis,
}: {
  leadId: string;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
  hasAnalysis: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function handleAnalyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "AI analysis failed");
      } else {
        const raw = JSON.stringify({
          pain_points: data.pain_points,
          lead_score: data.lead_score,
          email_draft: data.email_draft,
        });
        onUpdate(leadId, { ai_analysis: raw });
        toast.success("AI Intelligence generated!");
      }
    } catch {
      toast.error("Network error. Could not reach AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleAnalyze} disabled={loading} className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:from-purple-700 hover:to-blue-700 disabled:opacity-50">
      {loading ? <Spinner /> : <SparkleIcon />}
      {loading ? "Analyzing..." : hasAnalysis ? "Regenerate AI Intelligence" : "Generate AI Intelligence"}
    </button>
  );
}

function AiResults({ analysis, lead }: { analysis: { pain_points: string[]; lead_score: number; email_draft: string }; lead: Lead }) {
  const emailTo = lead.email || "";
  const subject = encodeURIComponent(`Idea for ${lead.name}`);
  const body = encodeURIComponent(analysis.email_draft);
  const mailtoUrl = `mailto:${emailTo}?subject=${subject}&body=${body}`;

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-zinc-200 bg-white p-4 sm:col-span-2 lg:col-span-3">
      <div className="flex items-center gap-2">
        <SparkleIcon className="h-4 w-4 text-purple-600" />
        <h4 className="text-sm font-semibold text-zinc-900">AI Intelligence</h4>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-zinc-500 uppercase tracking-wide">Lead Score</span>
          <span className="font-bold text-zinc-900">{analysis.lead_score}/100</span>
        </div>
        <div className="mt-1.5 h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${analysis.lead_score}%`,
              background: analysis.lead_score >= 70
                ? "linear-gradient(90deg, #22c55e, #16a34a)"
                : analysis.lead_score >= 40
                ? "linear-gradient(90deg, #eab308, #f59e0b)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
            }}
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Pain Points</p>
        <ul className="mt-1.5 space-y-1.5">
          {analysis.pain_points.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm text-zinc-800">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Email Draft</p>
        <textarea
          id={`email-draft-${lead.id}`}
          defaultValue={analysis.email_draft}
          rows={6}
          className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <a
          href={mailtoUrl}
          className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
        >
          <MailIcon />
          Send Email
        </a>
      </div>
    </div>
  );
}

function SocialLinksDisplay({ socials }: { socials: SocialLinks | null }) {
  if (!socials || Object.keys(socials).length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Social Links</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100">LinkedIn</a>}
        {socials.facebook && <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100">Facebook</a>}
        {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded bg-pink-50 px-2 py-0.5 text-xs text-pink-700 hover:bg-pink-100">Instagram</a>}
        {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200">Twitter/X</a>}
      </div>
    </div>
  );
}

function Detail({ label, value, isLink }: { label: string; value: string | null | undefined; isLink?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
      {value ? (
        isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-blue-600 hover:underline">{value}</a>
        ) : (
          <p className="mt-1 text-sm text-zinc-800">{value}</p>
        )
      ) : (
        <p className="mt-1 text-sm text-zinc-400">--</p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className || "h-3.5 w-3.5"} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
  );
}
