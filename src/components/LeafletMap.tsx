"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import type { Lead, SocialLinks } from "@/lib/types";
import { useState } from "react";

interface LeafletMapProps {
  leads: Lead[];
}

export default function LeafletMap({ leads: initialLeads }: LeafletMapProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [selected, setSelected] = useState<Lead | null>(null);

  const validLeads = leads.filter(
    (l) => l.lat != null && l.lng != null
  );

  const center: [number, number] =
    validLeads.length > 0
      ? [validLeads[0].lat!, validLeads[0].lng!]
      : [39.8283, -98.5795];

  function handleScraped(
    leadId: string,
    data: { email: string | null; social_links: SocialLinks | null }
  ) {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? { ...l, email: data.email ?? l.email, social_links: data.social_links }
          : l
      )
    );
    setSelected((prev) =>
      prev && prev.id === leadId
        ? { ...prev, email: data.email ?? prev.email, social_links: data.social_links }
        : prev
    );
  }

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full overflow-hidden rounded-lg border border-zinc-200">
      <MapContainer
        center={center}
        zoom={4}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validLeads.map((lead) => (
          <Marker
            key={lead.id}
            position={[lead.lat!, lead.lng!]}
            eventHandlers={{
              click: () => setSelected(lead),
            }}
          >
            <Popup>
              <strong>{lead.name}</strong>
              {lead.category && <br />}
              {lead.category}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selected && (
        <div className="absolute top-0 right-0 h-full w-full max-w-sm overflow-y-auto border-l border-zinc-200 bg-white shadow-xl sm:w-96">
          <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3">
            <h2 className="text-sm font-semibold text-zinc-900">Lead Details</h2>
            <button
              onClick={() => setSelected(null)}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              aria-label="Close panel"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4 p-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{selected.name}</h3>
              {selected.category && (
                <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {selected.category}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <Field label="Address" value={selected.address} />
              <Field label="Email" value={selected.email} />
              <Field label="Phone" value={selected.phone} />
              <Field label="Website" value={selected.website} isLink />
              <Field label="Latitude" value={selected.lat?.toString()} />
              <Field label="Longitude" value={selected.lng?.toString()} />
              <SocialLinksDisplay socials={selected.social_links} />
            </div>

            {selected.ai_analysis && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  AI Analysis
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                  {selected.ai_analysis}
                </p>
              </div>
            )}

            {selected.website && !selected.email && (
              <MapScrapeButton
                leadId={selected.id}
                website={selected.website}
                onScraped={handleScraped}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MapScrapeButton({
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
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Social Links</p>
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

function Field({
  label,
  value,
  isLink,
}: {
  label: string;
  value: string | null | undefined;
  isLink?: boolean;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-0.5 block text-sm text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="mt-0.5 text-sm text-zinc-800">{value}</p>
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
