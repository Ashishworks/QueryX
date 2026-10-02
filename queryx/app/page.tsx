"use client";

import { FormEvent, useRef, useState, useEffect, useMemo } from "react";
import SearchIcon from "@/components/icons/SearchIcon";
import {
  ArrowRight,
  Globe,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";

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

const suggestions = [
  "React server components",
  "JavaScript promises",
  "Node streams vs buffers",
  "Tailwind grid layouts",
  "React custom hooks",
  "Node.js event loop",
  "JavaScript async await",
  "React useEffect",
  "Node.js file system",
  "HTTP requests in Node.js",
  "React state management",
  "JavaScript modules",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // --- Smooth Dynamic Suggestions Logic ---
  const ITEMS_TO_SHOW = 3;
  const ROTATION_INTERVAL = 4000;
  
  const [startIndex, setStartIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Initial smooth load animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 2. Smooth rotation logic (Fade out -> Swap text -> Fade in)
  useEffect(() => {
    if (!suggestions || suggestions.length <= ITEMS_TO_SHOW) return;

    const timer = setInterval(() => {
      // Step A: Trigger fade out animation
      setIsVisible(false);

      // Step B: Wait for fade out to finish (500ms), then swap text and fade back in
      setTimeout(() => {
        setStartIndex((prev) => (prev + ITEMS_TO_SHOW) % suggestions.length);
        setIsVisible(true);
      }, 500); 

    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const visibleSuggestions = useMemo(() => {
    if (!suggestions || suggestions.length === 0) return [];
    if (suggestions.length <= ITEMS_TO_SHOW) return suggestions;

    return Array.from({ length: ITEMS_TO_SHOW }).map(
      (_, i) => suggestions[(startIndex + i) % suggestions.length]
    );
  }, [startIndex]);
  // ----------------------------------------

  async function search(searchQuery: string) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      return;
    }

    setQuery(trimmedQuery);
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

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(query);
    inputRef.current?.blur();
  }

  function handleSuggestion(value: string) {
    setQuery(value);
    search(value);
  }

  function clearSearch() {
    setQuery("");
    setResults([]);
    setSearched(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 selection:bg-blue-100 selection:text-blue-900">
      <div
        className={`mx-auto w-full max-w-3xl px-6 transition-all duration-700 ease-in-out ${
          searched ? "pt-12 md:pt-16" : "pt-[25vh]"
        }`}
      >
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
              QueryX
            </h1>
            <div className="flex h-12 w-12 items-center justify-center">
              <SearchIcon />
            </div>
          </div>

          <p className="max-w-md text-lg text-zinc-500">
            A lightweight search engine built from scratch.
          </p>
        </header>

        {/* Enhanced Search Form */}
        <form
          onSubmit={handleSearch}
          className="group relative mx-auto flex w-full max-w-2xl items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:border-zinc-300 hover:shadow-md focus-within:border-blue-500 focus-within:shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10"
        >
          {/* Search Icon - Changes color dynamically when the input is focused */}
          <Search className="absolute left-5 h-5 w-5 text-zinc-400 transition-colors duration-300 group-focus-within:text-blue-600" />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation, guides, and more..."
            className="peer h-16 w-full bg-transparent pl-14 pr-[104px] text-lg text-zinc-900 outline-none placeholder:text-zinc-400 transition-all"
          />

          {/* Actions Container */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {/* Clear Button - Added tactile scale effect */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 active:scale-90"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            )}

            {/* Submit Button - Added hover translation, active scale, and sleek disabled styling */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              aria-label="Search"
              className="group/btn flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-90 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5" />
              )}
            </button>
          </div>
        </form>

        {/* Dynamic Suggestions */}
        {!searched && (
          <div className="mt-12 flex flex-col items-center animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out">
            {/* Framed Heading with subtle lines */}
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-8 bg-zinc-200 rounded-full" />
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Try searching for
              </p>
              <div className="h-px w-8 bg-zinc-200 rounded-full" />
            </div>

            {/* Suggestions Container */}
            <div className="flex w-full max-w-3xl flex-wrap justify-center gap-3 px-4 min-h-[44px]">
              {visibleSuggestions.map((suggestion, index) => (
                <button
                  // We use index here so React KEEPS the element and animates it smoothly
                  key={index}
                  type="button"
                  onClick={() => handleSuggestion(suggestion)}
                  // Staggers them when fading in, hides them all at once when fading out
                  style={{ transitionDelay: isVisible ? `${index * 100}ms` : '0ms' }}
                  className={`
                    group flex items-center gap-0 overflow-hidden rounded-full border border-zinc-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-95
                    ${
                      isVisible
                        ? "opacity-100 translate-y-0 scale-100 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
                        : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                    }
                  `}
                >
                  {/* Dynamic Search Icon - slides in on hover */}
                  <Search className="h-4 w-0 -ml-1 text-blue-500 opacity-0 transition-all duration-300 ease-out group-hover:w-4 group-hover:opacity-100 group-hover:mr-2 group-hover:ml-0" />

                  <span className="relative whitespace-nowrap">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {searched && loading && (
          <div className="mt-12 space-y-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse flex-col gap-3"
              >
                <div className="h-4 w-1/3 rounded bg-zinc-200" />
                <div className="h-6 w-2/3 rounded bg-zinc-200" />
                <div className="h-10 w-full rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && !loading && (
          <section className="mt-10 pb-20 animate-in fade-in duration-500">
            <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
              <p className="text-sm font-medium text-zinc-500">
                Found {results.length}{" "}
                {results.length === 1 ? "result" : "results"} for{" "}
                <span className="text-zinc-900">
                  &quot;{query}&quot;
                </span>
              </p>

              <p className="hidden text-sm text-zinc-400 sm:block">
                QueryX Search
              </p>
            </div>

            {results.length > 0 ? (
              <div className="space-y-10">
                {results.map((result) => (
                  <article
                    key={result.docId}
                    className="group flex flex-col gap-1.5"
                  >
                    {/* URL */}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-fit max-w-full items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
                    >
                      <Globe className="h-3.5 w-3.5 shrink-0" />

                      <span className="truncate">
                        {result.url}
                      </span>
                    </a>

                    {/* Title */}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-fit"
                    >
                      <h2 className="text-xl font-semibold text-blue-600 underline-offset-4 decoration-blue-600/30 group-hover:underline">
                        {result.title}
                      </h2>
                    </a>

                    {/* Snippet */}
                    <p className="mt-1 max-w-3xl text-base leading-relaxed text-zinc-600">
                      {result.snippet}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              /* No Results */
              <div className="mt-20 flex flex-col items-center justify-center text-center">
                <div className="mb-4 rounded-full bg-zinc-100 p-4">
                  <Search className="h-8 w-8 text-zinc-400" />
                </div>

                <h3 className="mb-2 text-xl font-semibold text-zinc-900">
                  No results found
                </h3>

                <p className="max-w-sm text-center text-zinc-500">
                  We couldn&apos;t find anything matching{" "}
                  <span className="font-medium text-zinc-700">
                    &quot;{query}&quot;
                  </span>
                  . Try adjusting your search terms.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}