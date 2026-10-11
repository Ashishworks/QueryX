"use client";

import {
  RefObject,
  FormEvent,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
} from "react";
import { Search, X, Loader2 } from "lucide-react";

import LoadingIcon from "../icons/loading";

type SearchBarProps = {
  query: string;
  loading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onQueryChange: (val: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  onSuggestionSelect: (value: string) => void;
};

export default function SearchBar({
  query,
  loading,
  inputRef,
  onQueryChange,
  onSubmit,
  onClear,
  onSuggestionSelect,
}: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const requestId = useRef(0);
  const dismissed = useRef(false);
  const focused = useRef(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentId = ++requestId.current;
    const prefix = query.trim();

    if (!prefix || dismissed.current || !focused.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(prefix)}`
        );

        if (!response.ok) throw new Error("Suggestion request failed");

        const data: { suggestions: string[] } = await response.json();

        if (
          requestId.current !== currentId ||
          dismissed.current ||
          !focused.current
        ) {
          return;
        }

        setSuggestions(data.suggestions);
        setShowSuggestions(data.suggestions.length > 0);
        setActiveIndex(-1);
      } catch (error) {
        if (requestId.current === currentId) {
          console.error("Suggestion request failed:", error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  function closeSuggestions() {
    dismissed.current = true;
    requestId.current++;

    if (blurTimer.current) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }

    setShowSuggestions(false);
    setSuggestions([]);
    setActiveIndex(-1);
  }

  function selectSuggestion(value: string) {
    closeSuggestions();
    onSuggestionSelect(value);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      closeSuggestions();
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) =>
        i <= 0 ? suggestions.length - 1 : i - 1
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <form
        onSubmit={(event) => {
          closeSuggestions();
          onSubmit(event);
        }}
        className="group relative z-20 flex w-full items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 ease-out hover:border-zinc-300 hover:shadow-md focus-within:border-blue-500 focus-within:shadow-lg focus-within:ring-4 focus-within:ring-blue-500/10"
      >
        <Search className="absolute left-5 h-5 w-5 text-zinc-400 transition-colors duration-300 group-focus-within:text-blue-600" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => {
            dismissed.current = false;
            onQueryChange(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            focused.current = true;

            if (blurTimer.current) {
              clearTimeout(blurTimer.current);
              blurTimer.current = null;
            }

            if (dismissed.current) return;

            if (query.trim() && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            focused.current = false;

            blurTimer.current = setTimeout(() => {
              if (!focused.current) {
                setShowSuggestions(false);
              }
            }, 150);
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls="queryx-suggestions"
          placeholder="Search documentation, guides, and more..."
          className="peer h-16 w-full bg-transparent pl-14 pr-[104px] text-lg text-zinc-900 outline-none placeholder:text-zinc-400 transition-all"
        />

        <div className="absolute right-3 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                dismissed.current = false;
                requestId.current++;
                setSuggestions([]);
                setShowSuggestions(false);
                setActiveIndex(-1);
                onClear();
              }}
              aria-label="Clear search"
              className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:bg-zinc-100 hover:text-zinc-700 active:scale-90"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            aria-label="Search"
            // Changed classes below: removed bg, removed shadows, changed text color to match the design
            className="group/btn flex h-10 w-10 bg-transparent items-center justify-center rounded-xl text-zinc-400 transition-all duration-300 ease-out hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-90 disabled:cursor-not-allowed disabled:text-zinc-300"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LoadingIcon />
            )}
          </button>
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="queryx-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 -mt-2 overflow-hidden rounded-b-2xl border border-t-0 border-zinc-200 bg-white pb-2 pt-4 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              id={`queryx-suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
            >
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
                className={`flex w-full items-center gap-3 px-5 py-3 text-left text-sm transition-colors ${
                  index === activeIndex
                    ? "bg-blue-50 text-blue-700"
                    : "text-zinc-700 hover:bg-zinc-50"
                }`}
              >
                <Search className="h-4 w-4 shrink-0 text-zinc-400" />
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}