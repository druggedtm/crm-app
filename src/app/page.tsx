export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Welcome to your CRM application.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Total Leads</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">--</p>
          <p className="mt-1 text-xs text-zinc-400">Connect Supabase to see data</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Categories</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">--</p>
          <p className="mt-1 text-xs text-zinc-400">Unique lead categories</p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">With AI Analysis</p>
          <p className="mt-2 text-3xl font-bold text-zinc-900">--</p>
          <p className="mt-1 text-xs text-zinc-400">Leads with AI analysis</p>
        </div>
      </div>
    </div>
  );
}
