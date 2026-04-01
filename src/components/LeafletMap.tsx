"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import type { Lead } from "@/lib/types";
import { useState } from "react";

interface LeafletMapProps {
  leads: Lead[];
}

export default function LeafletMap({ leads }: LeafletMapProps) {
  const [selected, setSelected] = useState<Lead | null>(null);

  const validLeads = leads.filter(
    (l) => l.lat != null && l.lng != null
  );

  const center: [number, number] =
    validLeads.length > 0
      ? [validLeads[0].lat!, validLeads[0].lng!]
      : [39.8283, -98.5795];

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
          </div>
        </div>
      )}
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
