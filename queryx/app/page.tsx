"use client";

import { FormEvent, useRef, useState } from "react";
import SearchHeader from "@/components/search/SearchHeader";
import SearchBar from "@/components/search/SearchBar";
import SearchSuggestions from "@/components/search/SearchSuggestions";
import SearchResults from "@/components/search/SearchResults";
import { SearchResult, SearchResponse } from "@/types/search";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

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
        <SearchHeader />

        <SearchBar
          query={query}
          loading={loading}
          inputRef={inputRef}
          onQueryChange={setQuery}
          onSubmit={handleSearch}
          onClear={clearSearch}
        />

        {!searched && <SearchSuggestions onSuggestionClick={handleSuggestion} />}

        {searched && (
          <SearchResults query={query} results={results} loading={loading} />
        )}
      </div>
    </main>
  );
}