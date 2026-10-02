"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";

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

export default function SearchSuggestions({
  onSuggestionClick,
}: {
  onSuggestionClick: (value: string) => void;
}) {
  const ITEMS_TO_SHOW = 3;
  const ROTATION_INTERVAL = 4000;

  const [startIndex, setStartIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Initial smooth load animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // 2. Smooth rotation logic
  useEffect(() => {
    if (!suggestions || suggestions.length <= ITEMS_TO_SHOW) return;

    const timer = setInterval(() => {
      setIsVisible(false);

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

  return (
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
            key={index}
            type="button"
            onClick={() => onSuggestionClick(suggestion)}
            style={{ transitionDelay: isVisible ? `${index * 100}ms` : "0ms" }}
            className={`
              group flex items-center gap-0 overflow-hidden rounded-full border border-zinc-200 bg-white/80 px-5 py-2.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-500 ease-out focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-95
              ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
                  : "opacity-0 translate-y-4 scale-95 pointer-events-none"
              }
            `}
          >
            {/* Dynamic Search Icon */}
            <Search className="h-4 w-0 -ml-1 text-blue-500 opacity-0 transition-all duration-300 ease-out group-hover:w-4 group-hover:opacity-100 group-hover:mr-2 group-hover:ml-0" />

            <span className="relative whitespace-nowrap">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}