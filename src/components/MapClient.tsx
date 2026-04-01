"use client";

import dynamic from "next/dynamic";
import type { Lead } from "@/lib/types";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50">
      <p className="text-sm text-zinc-500">Loading map...</p>
    </div>
  ),
});

export default function MapClient({ leads }: { leads: Lead[] }) {
  return <LeafletMap leads={leads} />;
}
