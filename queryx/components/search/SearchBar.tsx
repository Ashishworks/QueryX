"use client";

import { RefObject, FormEvent } from "react";
import { Search, X, Loader2, ArrowRight } from "lucide-react";

type SearchBarProps = {
  query: string;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (val: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

export default function SearchBar({
  query,
  loading,
  inputRef,
  onQueryChange,
  onSubmit,
  onClear,
}: SearchBarProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="group relative mx-auto flex w-full max-w-2xl items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:border-zinc-300 hover:shadow-md focus-within:border-blue-500 focus-within:shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10"
    >
      {/* Search Icon - Changes color dynamically when the input is focused */}
      <Search className="absolute left-5 h-5 w-5 text-zinc-400 transition-colors duration-300 group-focus-within:text-blue-600" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search documentation, guides, and more..."
        className="peer h-16 w-full bg-transparent pl-14 pr-[104px] text-lg text-zinc-900 outline-none placeholder:text-zinc-400 transition-all"
      />

      {/* Actions Container */}
      <div className="absolute right-3 flex items-center gap-1.5">
        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 active:scale-90"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        )}

        {/* Submit Button */}
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
  );
}