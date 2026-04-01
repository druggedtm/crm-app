"use client";

import { useState } from "react";

export default function LeadFinderPage() {
  const [city, setCity] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/find-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, keyword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setMessage(data.message);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Lead Finder
        </h1>
        <p className="text-sm text-zinc-500">
          Search for businesses by city and keyword using OpenStreetMap data.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                placeholder="e.g. Chicago"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="keyword"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                Business Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="e.g. cafe, dentist, real estate"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Spinner />
                Searching...
              </>
            ) : (
              <>
                <SearchButtonIcon />
                Search &amp; Save Leads
              </>
            )}
          </button>
        </form>

        {message && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-zinc-900">How it works</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          <li className="flex gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            Enter a city name (e.g. &quot;Chicago&quot;, &quot;Austin&quot;, &quot;Portland&quot;)
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            Enter a business keyword (e.g. &quot;cafe&quot;, &quot;dentist&quot;, &quot;gym&quot;, &quot;salon&quot;)
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            We search OpenStreetMap via the Overpass API for matching businesses
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            Results are saved directly to your Supabase leads table
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400" />
            View them on the Leads page or the Map page
          </li>
        </ul>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function SearchButtonIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
      />
    </svg>
  );
}
