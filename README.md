# QueryX

> A local-first search engine built from scratch to explore crawling, information retrieval, ranking, and autocomplete.

QueryX is a lightweight developer-documentation search engine built with TypeScript and Next.js. It crawls a controlled collection of websites, stores extracted documents in a local SQLite database, builds an in-memory inverted index, ranks results using field-aware BM25, and provides Trie-based autocomplete.

The goal is to understand how the fundamental pieces of a search engine work together—from crawling and indexing to retrieval, ranking, and presenting results—without relying on a hosted search service or large-scale infrastructure.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Search Pipeline](#search-pipeline)
- [Autocomplete](#autocomplete)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development and Tests](#development-and-tests)
- [Current Design Notes](#current-design-notes)
- [Roadmap](#roadmap)
- [Design Principles](#design-principles)
- [Responsible Crawling](#responsible-crawling)

## Overview

QueryX is designed as a local learning and engineering project. It implements the core parts of a traditional keyword-based search system using data structures and algorithms directly.

At a high level, the project:

1. Crawls a controlled set of developer-focused websites.
2. Canonicalizes URLs and avoids duplicate discovery.
3. Parses pages and extracts titles, headings, body text, and links.
4. Stores documents persistently in SQLite.
5. Tokenizes document fields and builds an inverted index.
6. Processes user queries against the index.
7. Scores candidate documents using field-aware BM25.
8. Selects the highest-scoring results.
9. Generates snippets from stored document text.
10. Displays results in a Next.js interface.

QueryX is intended for a modest local corpus, not as a replacement for production-scale search infrastructure.

## Features

### Crawling and document storage

- URL canonicalization and duplicate handling
- Queue-based crawl frontier and visited/discovered URL tracking
- HTML parsing and extraction of searchable document content
- Crawl safety controls, including domain and depth limits
- `robots.txt` support
- Local persistent storage with SQLite
- URL uniqueness with insert-or-update behavior

### Indexing and retrieval

- Shared tokenization for document fields and queries
- In-memory inverted index implemented with `Map`
- Field-level term frequencies for titles, headings, and body text
- Document-length statistics for ranking
- Candidate retrieval from term postings
- Field-aware BM25 ranking
- Min-Heap implementation for Top-K selection
- SQLite lookup to assemble result metadata
- Query-term-based snippet generation

### Autocomplete and interface

- Trie built from the indexed vocabulary
- Prefix-based suggestions for the current query word
- Suggestions ordered by document frequency, with alphabetical tie-breaking
- Debounced autocomplete requests
- Keyboard navigation with arrow keys, Enter, and Escape
- Protection against stale suggestion responses
- Search result loading states and empty-result UI
- Rotating example queries on the initial page

## Architecture

The document collection and search structures are local. SQLite stores the source documents, while the inverted index and Trie are derived in-memory structures.

```text
                  CRAWLING AND INDEXING

Seed URLs
   |
   v
Crawler + URL Frontier
   |
   v
Canonicalization / Safety / robots.txt
   |
   v
HTML Parser
   |
   v
SQLite Document Store
   |
   v
Tokenizer + Index Builder
   |
   +-------------------------+
   |                         |
   v                         v
Inverted Index              Trie
   |                         |
   v                         v
Query Processing         Autocomplete API
   |
   v
Field-Aware BM25
   |
   v
Top-K Selection
   |
   v
SQLite Metadata + Snippets
   |
   v
Search API
   |
   v
Next.js Search UI
```

## Search Pipeline

When a user submits a query such as `react hooks`, QueryX follows this path:

```text
User query
   |
   v
Tokenization
   |
   v
Inverted-index lookup
   |
   v
Candidate document postings
   |
   v
Field-aware BM25 scoring
   |
   v
Top-K result selection
   |
   v
Document metadata lookup
   |
   v
Snippet generation
   |
   v
JSON response
   |
   v
Search results UI
```

### Inverted index

The index maps each normalized term to the documents containing it. Each posting preserves term frequency by field:

```ts
type Posting = {
  docId: number;
  titleTF: number;
  headingTF: number;
  bodyTF: number;
};
```

Keeping these fields separate allows a match in a title to contribute differently from a match in body text.

### BM25 ranking

QueryX uses BM25 with separate contributions for titles, headings, and body text. The current field weights are:

| Field | Weight |
|---|---:|
| Title | 3 |
| Heading | 2 |
| Body | 1 |

The implementation uses `k1 = 1.2` and `b = 0.75`, with a smoothed inverse-document-frequency calculation. Document-length statistics and average field lengths are calculated when the index is built.

These values are initial engineering choices, not universal constants. A future evaluation suite can help determine whether changes improve search quality.

### Top-K selection

QueryX includes a Min-Heap implementation that retains the highest-scoring `K` documents and sorts the selected results before returning them. The current ranking function also sorts scored documents, so avoiding that redundant full sort is a known optimization opportunity.

### Snippets

For each selected result, QueryX retrieves the document's title, URL, and text from SQLite. The snippet generator searches for the earliest query-term substring and returns a bounded text window around it, adding ellipses when text has been omitted.

Snippet generation is intentionally simple in the current version. It does not yet highlight matches or guarantee token-boundary matching.

## Autocomplete

Autocomplete uses a Trie constructed from the terms in the inverted index.

```text
User types: react ho
                 |
                 v
        Current prefix: ho
                 |
                 v
             Trie lookup
                 |
                 v
      Filter and rank matching terms
                 |
                 v
        Complete the existing query
```

The suggestions module preserves the already-entered portion of the query and completes its final word. Candidate terms are filtered and ordered by document frequency, then alphabetically. The API defaults to eight suggestions and caps the requested number at ten.

The frontend debounces requests, tracks request IDs to ignore stale responses, and supports keyboard navigation and dismissal. The homepage also has a separate set of static example queries that rotate before the user performs a search.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend and API | Next.js, React, TypeScript |
| Styling and icons | Tailwind CSS, Lucide |
| Crawling and parsing | Node.js, native `fetch`, `htmlparser2`, `robots-parser` |
| Persistent storage | SQLite, `better-sqlite3` |
| Search structures | TypeScript `Map`, Trie, Min-Heap |
| Ranking | Field-aware BM25 |
| Development | Git, GitHub, VS Code |

## Project Structure

The main source directories are organized by responsibility:

```text
queryx/
├── app/
│   ├── api/
│   │   └── search/
│   │       ├── route.ts
│   │       └── suggestions/
│   │           └── route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── icons/
│   └── search/
│       ├── SearchBar.tsx
│       ├── SearchHeader.tsx
│       ├── SearchResults.tsx
│       └── SearchSuggestions.tsx
├── config/
│   └── crawler.ts
├── crawler/
│   ├── canonicalize.ts
│   ├── crawler.ts
│   ├── fetcher.ts
│   ├── frontier.ts
│   ├── parser.ts
│   ├── robots.ts
│   ├── safety.ts
│   └── types.ts
├── indexer/
│   ├── build-index.ts
│   ├── build-trie.ts
│   ├── inverted-index.ts
│   ├── tokenizer.ts
│   ├── trie.ts
│   └── types.ts
├── parser/
│   ├── html-parser.ts
│   └── types.ts
├── search/
│   ├── engine.ts
│   ├── query.ts
│   ├── ranking.ts
│   ├── snippets.ts
│   ├── suggestions.ts
│   ├── top-k.ts
│   └── test-*.ts
├── storage/
│   ├── database.ts
│   ├── document.ts
│   └── schema.ts
├── types/
│   └── search.ts
├── data/                 # Local database; should not be committed
├── package.json
└── README.md
```

The exact file list may evolve as the project develops.

## Getting Started

### Prerequisites

- Node.js compatible with the versions specified by the project
- npm
- Git

`better-sqlite3` is a native dependency, so use a Node.js version supported by the package and the project's lockfile.

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The search engine builds its in-memory index from the local SQLite database when the search module is initialized. Make sure the database has documents before expecting meaningful search results.

> **Note:** Check `package.json` for the exact crawler and test scripts available in your checkout. This README intentionally does not assume script names that may differ between project versions.

## Development and Tests

The repository contains focused test scripts for core components, including:

- URL canonicalization and crawl frontier behavior
- Fetching, parsing, robots rules, and crawler safety
- Tokenization and inverted-index construction
- Trie construction and autocomplete
- Query processing and BM25 ranking
- Top-K selection and snippet generation
- SQLite storage

Several current test scripts print their outputs for manual inspection. A planned improvement is a repeatable search-quality evaluation suite using fixed queries and labeled relevant documents.

Example direct test commands, assuming `tsx` is available in the project:

```bash
npx tsx search/test-query.ts
npx tsx search/test-ranking.ts
npx tsx search/test-top-k.ts
npx tsx search/test-snippets.ts
```

Run these from the `queryx/` directory. Check each test's imports and side effects before running it; some scripts open the local database and close it when finished.

## Current Design Notes

### Local-first by design

- SQLite is the persistent source of crawled documents.
- The inverted index and Trie are derived in-memory structures.
- No hosted search service, cloud database, vector database, or distributed infrastructure is required.

### Index lifecycle

The current search engine and suggestions module build their in-memory structures at module initialization. Database changes made afterward do not automatically refresh those structures. An explicit and reliable index lifecycle is a future improvement.

### Ranking and evaluation

BM25 is implemented and has diagnostic tests, but ranking quality has not yet been established through a formal relevance benchmark. The next evaluation milestone is to define representative queries and relevance judgments, then calculate metrics such as Precision@K, Recall@K, and Mean Reciprocal Rank (MRR).

### Known improvement opportunities

- Avoid sorting all scored documents before applying the Top-K heap.
- Add reproducible search-quality evaluation.
- Improve snippets with better match boundaries and optional highlighting.
- Add an explicit index refresh/rebuild lifecycle.
- Distinguish API failures from valid searches that return no results.

## Roadmap

Planned work, subject to test results and project priorities:

- [ ] Build a labeled search evaluation dataset.
- [ ] Measure Precision@K, Recall@K, and MRR.
- [ ] Record a ranking baseline before tuning.
- [ ] Remove redundant work in the ranking and Top-K pipeline.
- [ ] Improve snippet relevance and presentation.
- [ ] Make index refresh and rebuild behavior explicit.
- [ ] Benchmark indexing, search, and autocomplete as the corpus grows.

The roadmap is deliberately measurement-driven: improve the system based on observed quality or performance limitations rather than adding infrastructure prematurely.

## Design Principles

1. **Build the fundamentals.** Implement the core retrieval structures and algorithms directly.
2. **Keep components focused.** Crawling, storage, indexing, ranking, and UI should have clear responsibilities.
3. **Preserve useful information.** Keep title, heading, and body statistics separate so ranking can use them.
4. **Separate source data from derived state.** SQLite stores documents; indexes are rebuilt from that source.
5. **Measure before optimizing.** Use repeatable tests and benchmarks to guide changes.
6. **Keep the system local and understandable.** Avoid infrastructure that does not solve a demonstrated problem.

## Responsible Crawling

QueryX is an educational project intended to crawl a controlled set of websites conservatively.

- Respect applicable `robots.txt` rules.
- Use reasonable request delays and timeouts.
- Limit crawl depth, page counts, and response sizes.
- Avoid unnecessary requests and unsupported resources.
- Do not bypass authentication, access controls, or rate limits.
- Review each site's policies before crawling it.

## Learning Outcomes

QueryX brings together concepts that are often studied separately:

- Queue-based crawling and URL deduplication
- URL canonicalization and HTML parsing
- Persistent storage with SQLite
- Tokenization and inverted indexes
- Term frequency and document frequency
- Field-aware BM25 ranking
- Trie-based prefix completion
- Min-Heap Top-K selection
- API and frontend integration
- Testing, evaluation, and performance measurement

The central objective is to understand how these components combine into a working search system.

---

> **Build the fundamentals. Measure the results. Let real bottlenecks determine what comes next.**
