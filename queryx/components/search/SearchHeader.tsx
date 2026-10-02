import SearchIcon from "@/components/icons/SearchIcon";

export default function SearchHeader() {
  return (
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
  );
}