"use client";

import type { Lead, SocialLinks } from "@/lib/types";
import { useState, useCallback } from "react";

interface LeadsTableProps {
  leads: Lead[];
}

export default function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleScraped = useCallback(
    (leadId: string, data: { email: string | null; social_links: SocialLinks | null }) => {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, email: data.email ?? l.email, social_links: data.social_links }
            : l
        )
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
                  onScraped={handleScraped}
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
  onScraped,
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
  onScraped: (leadId: string, data: { email: string | null; social_links: SocialLinks | null }) => void;
}) {
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
            <a
              href={lead.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline truncate block max-w-[180px]"
            >
              {lead.website}
            </a>
          ) : (
            <span className="text-zinc-400">--</span>
          )}
        </td>
        <td className="px-4 py-3">
          <button
            onClick={onToggle}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="Expand row"
          >
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
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
              {lead.ai_analysis && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">AI Analysis</p>
                  <p className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap">{lead.ai_analysis}</p>
                </div>
              )}
              {lead.website && !lead.email && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <ScrapeButton leadId={lead.id} website={lead.website} onScraped={onScraped} />
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function ScrapeButton({
  leadId,
  website,
  onScraped,
}: {
  leadId: string;
  website: string;
  onScraped: (leadId: string, data: { email: string | null; social_links: SocialLinks | null }) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleScrape() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/scrape-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website, leadId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Scrape failed");
      } else {
        onScraped(leadId, { email: data.email, social_links: data.social_links });
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleScrape}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? <Spinner /> : <ScrapeIcon />}
        {loading ? "Scraping..." : "Scrape Contact Info"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function SocialLinksDisplay({ socials }: { socials: SocialLinks | null }) {
  if (!socials || Object.keys(socials).length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Social Links</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {socials.linkedin && (
          <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100">
            LinkedIn
          </a>
        )}
        {socials.facebook && (
          <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 hover:bg-blue-100">
            Facebook
          </a>
        )}
        {socials.instagram && (
          <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-pink-50 px-2 py-0.5 text-xs text-pink-700 hover:bg-pink-100">
            Instagram
          </a>
        )}
        {socials.twitter && (
          <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 hover:bg-zinc-200">
            Twitter/X
          </a>
        )}
      </div>
    </div>
  );
}

function Detail({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
      {value ? (
        isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-sm text-blue-600 hover:underline"
          >
            {value}
          </a>
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

function ScrapeIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}
