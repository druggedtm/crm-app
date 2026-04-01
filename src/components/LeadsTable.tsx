"use client";

import type { Lead } from "@/lib/types";
import { useState } from "react";

interface LeadsTableProps {
  leads: Lead[];
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [search, setSearch] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

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
}: {
  lead: Lead;
  expanded: boolean;
  onToggle: () => void;
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
              {lead.ai_analysis && (
                <div className="sm:col-span-2 lg:col-span-3">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">AI Analysis</p>
                  <p className="mt-1 text-sm text-zinc-800 whitespace-pre-wrap">{lead.ai_analysis}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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
