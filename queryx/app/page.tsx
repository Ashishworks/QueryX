"use client";

import { FormEvent, useState } from "react";

type SearchResult = {
  docId: number;
  title: string;
  url: string;
  snippet: string;
  score: number;
};

type SearchResponse = {
  query: string;
  terms: string[];
  results: SearchResult[];
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      const data: SearchResponse = await response.json();

      setResults(data.results);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <div className="mx-auto w-full max-w-4xl px-6 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-semibold tracking-tight">
            QueryX
          </h1>

          <p className="mt-3 text-zinc-500">
            A lightweight search engine built from scratch.
          </p>
        </header>

        <form
          onSubmit={handleSearch}
          className="mx-auto flex max-w-2xl gap-3"
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="h-12 flex-1 rounded-xl border border-zinc-300 px-4 outline-none transition focus:border-zinc-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-zinc-900 px-6 font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {searched && !loading && (
          <div className="mt-10">
            <p className="mb-6 text-sm text-zinc-500">
              {results.length} result
              {results.length === 1 ? "" : "s"} for{" "}
              <span className="font-medium text-zinc-900">
                &quot;{query}&quot;
              </span>
            </p>

            <div className="space-y-8">
              {results.map((result) => (
                <article key={result.docId}>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <h2 className="text-xl font-medium text-blue-700 group-hover:underline">
                      {result.title}
                    </h2>

                    <p className="mt-1 truncate text-sm text-green-700">
                      {result.url}
                    </p>
                  </a>

                  <p className="mt-2 text-sm leading-6 text-zinc-600">
                    {result.snippet}
                  </p>
                </article>
              ))}
            </div>

            {results.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                No results found.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}