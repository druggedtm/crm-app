import { supabase } from "@/lib/supabase";
import type { Lead } from "@/lib/types";
import LeadsTable from "@/components/LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <h2 className="text-lg font-semibold">Error loading leads</h2>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Leads</h1>
          <p className="text-sm text-zinc-500">
            {(leads as Lead[])?.length ?? 0} total leads
          </p>
        </div>
      </div>
      <LeadsTable leads={(leads as Lead[]) ?? []} />
    </div>
  );
}
