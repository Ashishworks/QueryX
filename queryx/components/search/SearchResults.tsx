import { Globe, Search } from "lucide-react";
import { SearchResult } from "@/types/search";

type SearchResultsProps = {
  query: string;
  results: SearchResult[];
  loading: boolean;
};

export default function SearchResults({
  query,
  results,
  loading,
} // Fix missing closing parenthesis here if needed
: SearchResultsProps) {
  if (loading) {
    return (
      <div className="mt-12 space-y-8">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex animate-pulse flex-col gap-3">
            <div className="h-4 w-1/3 rounded bg-zinc-200" />
            <div className="h-6 w-2/3 rounded bg-zinc-200" />
            <div className="h-10 w-full rounded bg-zinc-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-10 pb-20 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between border-b border-zinc-100 pb-4">
        <p className="text-sm font-medium text-zinc-500">
          Found {results.length} {results.length === 1 ? "result" : "results"}{" "}
          for <span className="text-zinc-900">&quot;{query}&quot;</span>
        </p>

        <p className="hidden text-sm text-zinc-400 sm:block">QueryX Search</p>
      </div>

      {results.length > 0 ? (
        <div className="space-y-10">
          {results.map((result) => (
            <article key={result.docId} className="group flex flex-col gap-1.5">
              {/* URL */}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit max-w-full items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-800"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{result.url}</span>
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
  );
}