# QueryX

> A local-first, lightweight search engine built from scratch to understand how real information-retrieval systems work.

QueryX is a personal search engine that crawls a controlled collection of real websites, stores the extracted documents locally, builds its own inverted index, ranks search results, generates snippets, and provides Trie-based autocomplete through a Next.js interface.

The project is intentionally designed as a **V1 learning and engineering project** rather than an attempt to reproduce the infrastructure of Google, Bing, Elasticsearch, or another production-scale search engine.

The goal is to build the complete fundamental search pipeline ourselves:

```text
Seed URLs
    ↓
Crawler
    ↓
URL Queue + Visited Set
    ↓
URL Canonicalization
    ↓
HTML Parser
    ↓
SQLite Document Store
    ↓
Text Processing
    ↓
Inverted Index
    ↓
Query Processing
    ↓
TF-IDF / BM25 Ranking
    ↓
Top-K Min-Heap
    ↓
Snippet Generation
    ↓
Next.js Search UI
```

Autocomplete follows a separate path:

```text
Indexed Vocabulary
       ↓
      Trie
       ↓
Prefix Matching
       ↓
Suggestions
       ↓
Search Box
```

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Why QueryX Exists](#2-why-queryx-exists)
- [3. Project Goals](#3-project-goals)
- [4. V1 Scope](#4-v1-scope)
- [5. Non-Goals](#5-non-goals)
- [6. Core Concepts Demonstrated](#6-core-concepts-demonstrated)
- [7. Architecture](#7-architecture)
- [8. End-to-End Data Flow](#8-end-to-end-data-flow)
- [9. Technology Stack](#9-technology-stack)
- [10. Project Structure](#10-project-structure)
- [11. Crawler](#11-crawler)
- [12. URL Canonicalization](#12-url-canonicalization)
- [13. Crawl Frontier](#13-crawl-frontier)
- [14. Crawl Safety](#14-crawl-safety)
- [15. HTML Parsing](#15-html-parsing)
- [16. SQLite Document Store](#16-sqlite-document-store)
- [17. Text Processing](#17-text-processing)
- [18. Inverted Index](#18-inverted-index)
- [19. Field-Aware Postings](#19-field-aware-postings)
- [20. Query Processing](#20-query-processing)
- [21. Ranking](#21-ranking)
- [22. Top-K Min-Heap](#22-top-k-min-heap)
- [23. Snippet Generation](#23-snippet-generation)
- [24. Trie Autocomplete](#24-trie-autocomplete)
- [25. Next.js Application](#25-nextjs-application)
- [26. Index Lifecycle and Runtime State](#26-index-lifecycle-and-runtime-state)
- [27. Configuration](#27-configuration)
- [28. Installation](#28-installation)
- [29. Running QueryX](#29-running-queryx)
- [30. Development Workflow](#30-development-workflow)
- [31. Testing Strategy](#31-testing-strategy)
- [32. Benchmarking](#32-benchmarking)
- [33. Performance Expectations](#33-performance-expectations)
- [34. Failure Handling](#34-failure-handling)
- [35. V1 Milestones](#35-v1-milestones)
- [36. V1 Acceptance Criteria](#36-v1-acceptance-criteria)
- [37. Future V2 Ideas](#37-future-v2-ideas)
- [38. Design Principles](#38-design-principles)
- [39. Learning Objectives](#39-learning-objectives)
- [40. License and Responsible Crawling](#40-license-and-responsible-crawling)

---

# 1. Project Overview

QueryX is a **local-first search engine** designed to demonstrate the fundamental components behind a traditional keyword-based web search system.

The application runs entirely on a developer's laptop. It does not require cloud infrastructure, authentication, a hosted database, Redis, a vector database, or a distributed cluster.

A typical QueryX workflow is:

1. Configure a small set of seed websites.
2. Start the crawler.
3. Discover pages by following links.
4. Canonicalize URLs and prevent duplicates.
5. Respect basic crawling restrictions.
6. Parse downloaded HTML.
7. Extract titles, headings, body text, and outgoing links.
8. Store documents in SQLite.
9. Normalize and tokenize document text.
10. Build a field-aware inverted index.
11. Build a Trie for autocomplete.
12. Enter a query in the web interface.
13. Retrieve candidate documents from the inverted index.
14. Calculate relevance scores.
15. Maintain the best K results with a Min-Heap.
16. Retrieve document metadata from SQLite.
17. Generate short relevant snippets.
18. Display ranked results in the Next.js interface.

The initial target is approximately:

```text
1,000 pages
```

After the system is stable, the corpus can be increased toward:

```text
2,000–5,000 pages
```

The system should be benchmarked as the corpus grows.

---

# 2. Why QueryX Exists

Many software projects use data structures only in isolated coding exercises.

For example:

```text
Queue → BFS problem
HashMap → frequency problem
Heap → Top-K problem
Trie → prefix problem
```

QueryX uses these concepts in a connected real-world system.

Each data structure has a specific responsibility:

| Concept | QueryX Usage |
|---|---|
| Queue | Manage URLs waiting to be crawled |
| HashSet | Prevent duplicate URL discovery |
| Map / HashMap | Store inverted-index structures |
| Trie | Prefix-based autocomplete |
| Min-Heap / Priority Queue | Maintain Top-K search results |
| Graph concepts | Model the implicit web-link structure |
| SQLite indexes | Efficient persistent document lookup |
| TF-IDF / BM25 | Calculate document relevance |

The project is therefore intended to bridge the gap between:

```text
DSA theory
     ↓
Algorithms
     ↓
Data structures
     ↓
Information retrieval
     ↓
Real software architecture
```

---

# 3. Project Goals

The primary goals of QueryX V1 are:

### 3.1 Build a complete search pipeline

The system should work from:

```text
URL
→ webpage
→ document
→ index
→ query
→ ranking
→ result
```

### 3.2 Implement important data structures ourselves

The project should provide practical implementations of:

- Queue
- Set
- Map-based inverted index
- Trie
- Min-Heap / Priority Queue

### 3.3 Understand information retrieval

The project should demonstrate:

- Tokenization
- Normalization
- Term Frequency
- Document Frequency
- Inverse Document Frequency
- TF-IDF
- Optional BM25
- Field weighting
- Candidate retrieval
- Top-K retrieval

### 3.4 Keep the architecture understandable

Every component should have a clear reason to exist.

The project should avoid infrastructure that does not provide meaningful value at this scale.

### 3.5 Use real websites

The crawler should operate on real developer-focused websites, subject to their crawling policies.

Possible seed websites include:

- MDN
- React documentation
- Next.js documentation
- Node.js documentation
- TypeScript documentation

The exact seed set is configurable.

---

# 4. V1 Scope

QueryX V1 includes:

### Crawler

- Seed URLs
- URL queue
- Visited URL Set
- URL canonicalization
- Relative URL resolution
- Domain limits
- Crawl depth limits
- Maximum total pages
- Response-size limits
- HTML-only filtering
- Request timeout
- Request delay
- `robots.txt` support
- Per-domain scheduling

### Parser

- HTML parsing with `htmlparser2`
- Title extraction
- Heading extraction
- Visible body text extraction
- Outgoing link extraction

### Storage

- SQLite
- Persistent document storage
- URL uniqueness
- Crawl metadata
- Optional content hashing

### Indexing

- Tokenization
- Lowercase normalization
- Punctuation handling
- Optional stop-word removal
- Field-specific term frequency
- Document frequency
- Inverted index
- Trie vocabulary

### Search

- Query normalization
- Candidate retrieval
- TF-IDF
- Optional BM25
- Title/heading/body weighting
- Top-K retrieval
- Min-Heap
- SQLite metadata lookup
- Snippet generation

### Frontend

- Search box
- Autocomplete
- Result cards
- Titles
- URLs
- Snippets
- Search latency
- Basic corpus statistics

---

# 5. Non-Goals

The following are intentionally excluded from QueryX V1.

### Distributed crawling

No:

- crawler cluster
- distributed frontier
- sharding
- domain hashing
- worker orchestration

### Advanced storage engines

No:

- LSM tree
- MemTable
- SSTable
- custom binary index format
- segment merging

### Large-scale infrastructure

No:

- Redis
- Kafka
- Elasticsearch
- OpenSearch
- cloud databases
- Kubernetes
- microservices

### Advanced search

No:

- Boolean search
- phrase search
- positional indexes
- fuzzy search
- spelling correction
- semantic search
- embeddings
- vector database
- LLM-based ranking

### Advanced ranking

No:

- PageRank
- learning-to-rank
- neural ranking
- click-through-rate models

### Other

No:

- authentication
- multi-user support
- Chrome extension
- paid APIs
- public deployment requirement
- C++ implementation

These features may become future experiments if actual V1 limitations justify them.

---

# 6. Core Concepts Demonstrated

## Queue

The crawler maintains URLs waiting to be processed.

```text
Queue:

A → B → C → D
↑
next
```

This provides a natural breadth-first crawling strategy.

---

## HashSet

The crawler uses a Set to remember discovered URLs.

```text
visited = {
    https://example.com,
    https://example.com/docs,
    https://example.com/about
}
```

Before adding a URL:

```text
canonicalize(url)
       ↓
visited?
       ↓
   no → add
```

This prevents repeated crawling.

---

## Map

The inverted index is naturally represented with a Map:

```text
term → postings
```

Example:

```text
react → [...]
hooks → [...]
javascript → [...]
```

---

## Trie

The Trie provides prefix lookup:

```text
rea
 ↓
react
reactive
```

---

## Min-Heap

The ranking layer may encounter hundreds of candidate documents.

If only the top 10 results are required, QueryX can maintain:

```text
heap size = 10
```

instead of sorting every candidate.

---

# 7. Architecture

The high-level architecture is:

```text
                        ┌───────────────┐
                        │   Seed URLs   │
                        └───────┬───────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │     Crawler     │
                       └────────┬────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
                 Queue       Visited    Canonicalizer
                    │           │
                    └─────┬─────┘
                          │
                          ▼
                   Per-domain scheduler
                          │
                          ▼
                     HTTP Fetch
                          │
                          ▼
                    robots.txt
                          │
                          ▼
                    HTML Parser
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           Title       Headings       Body
             │            │            │
             └────────────┼────────────┘
                          │
                          ▼
                        SQLite
                          │
                          ▼
                      Indexer
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
       Inverted Index               Trie
              │                       │
              ▼                       ▼
       Query Processing          Autocomplete
              │
              ▼
       Candidate Retrieval
              │
              ▼
       TF-IDF / BM25
              │
              ▼
        Field Boosting
              │
              ▼
          Min-Heap
              │
              ▼
            Top-K
              │
              ▼
        SQLite Metadata
              │
              ▼
        Snippet Generation
              │
              ▼
         Search API
              │
              ▼
         Next.js UI
```

---

# 8. End-to-End Data Flow

Suppose the user searches:

```text
react hooks
```

The complete search path is:

```text
User Query
    ↓
"react hooks"
    ↓
Tokenization
    ↓
["react", "hooks"]
    ↓
Normalization
    ↓
["react", "hooks"]
    ↓
Inverted Index
    ↓
Candidate Documents
    ↓
TF-IDF / BM25
    ↓
Field Boosting
    ↓
Min-Heap
    ↓
Top 10 Documents
    ↓
SQLite
    ↓
Metadata + Text
    ↓
Snippet Generator
    ↓
JSON Response
    ↓
Next.js UI
```

Autocomplete happens before the search:

```text
User types:

rea

    ↓

Trie

    ↓

react
reactive
reaction
```

---

# 9. Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Crawler

- TypeScript
- Native `fetch`
- `htmlparser2`
- `robots-parser`

## Database

- SQLite
- `better-sqlite3`

## Search Engine

Custom TypeScript implementation of:

- Tokenization
- Normalization
- Inverted index
- TF-IDF
- Optional BM25
- Min-Heap
- Trie

## Runtime

Node.js

## Development

- Git
- GitHub
- VS Code

---

# 10. Project Structure

The current project intentionally does not use a `src/` directory.

```text
queryx/
│
├── app/
│   ├── api/
│   │   ├── search/
│   │   └── autocomplete/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── crawler/
│   ├── crawler.ts
│   ├── fetcher.ts
│   ├── frontier.ts
│   ├── canonicalize.ts
│   ├── robots.ts
│   └── types.ts
│
├── parser/
│   ├── html-parser.ts
│   └── types.ts
│
├── storage/
│   ├── database.ts
│   ├── documents.ts
│   └── schema.ts
│
├── indexer/
│   ├── tokenizer.ts
│   ├── normalizer.ts
│   ├── inverted-index.ts
│   ├── trie.ts
│   └── types.ts
│
├── search/
│   ├── query.ts
│   ├── ranking.ts
│   ├── top-k.ts
│   └── snippets.ts
│
├── config/
│   └── crawler.ts
│
├── data/
│   └── queryx.db
│
├── public/
│
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

The SQLite database should remain local and should be ignored by Git.

---

# 11. Crawler

The crawler is responsible for discovering and downloading documents.

Its basic lifecycle is:

```text
Seed
 ↓
Canonicalize
 ↓
Check visited
 ↓
Check robots.txt
 ↓
Schedule
 ↓
Fetch
 ↓
Parse
 ↓
Store
 ↓
Extract links
 ↓
Canonicalize links
 ↓
Add new links
```

The crawler should initially operate on a controlled number of pages.

Recommended progression:

```text
10 pages
 ↓
100 pages
 ↓
1,000 pages
 ↓
2,000–5,000 pages
```

---

# 12. URL Canonicalization

URL canonicalization prevents obvious duplicate URLs.

Examples of possible normalization:

```text
https://example.com/page
https://example.com/page/
```

Depending on the site, these may represent the same resource.

Fragments should generally be removed:

```text
https://example.com/docs#hooks
```

becomes:

```text
https://example.com/docs
```

Obvious tracking parameters can also be removed.

Examples:

```text
utm_source
utm_medium
utm_campaign
utm_term
utm_content
```

Canonicalization must be conservative.

Query parameters should not be blindly removed because some websites legitimately use query parameters to identify different content.

---

# 13. Crawl Frontier

The frontier manages URLs that have been discovered but not yet crawled.

The basic structure uses:

```text
Queue<CrawlTask>
```

where:

```ts
type CrawlTask = {
    url: string;
    depth: number;
};
```

The frontier also maintains a visited/discovered Set.

The crawler should mark a URL as discovered when it is accepted into the frontier rather than waiting until after downloading it.

This prevents multiple pages from simultaneously enqueueing the same URL.

---

# 14. Crawl Safety

QueryX V1 should crawl conservatively.

The crawler supports:

### Maximum pages

Example:

```text
MAX_PAGES = 1000
```

### Maximum depth

Example:

```text
MAX_DEPTH = 3
```

### Maximum pages per domain

Example:

```text
MAX_PAGES_PER_DOMAIN = 300
```

### Response size limit

Large responses should be rejected.

Example:

```text
MAX_RESPONSE_SIZE = 5 MB
```

### Request timeout

A request should not wait forever.

Example:

```text
TIMEOUT = 10 seconds
```

### HTML-only filtering

Ignore resources such as:

- images
- videos
- ZIP files
- PDFs
- audio
- arbitrary binary files

unless explicitly supported later.

### robots.txt

The crawler should respect the site's published crawling rules where applicable.

### Request delay

Requests to the same host should be separated by a conservative delay.

---

# 15. HTML Parsing

QueryX uses `htmlparser2`.

The parser extracts:

```text
URL
Title
Headings
Visible Text
Outgoing Links
```

Example:

```ts
type ParsedDocument = {
    url: string;
    title: string;
    headings: string[];
    text: string;
    links: string[];
};
```

Scripts and styles should not be treated as ordinary document text.

The goal is not to perfectly reproduce browser rendering.

The goal is to obtain useful searchable content efficiently.

---

# 16. SQLite Document Store

SQLite is the persistent document store.

It is appropriate for V1 because:

- it is local
- it is free
- it requires no database server
- it persists across application restarts
- it can comfortably handle the intended corpus
- it provides transactional storage
- it keeps the architecture simple

A basic document schema is:

```text
documents
---------
id
url
title
headings
text
crawl_time
content_hash
```

Possible constraints:

```text
UNIQUE(url)
```

The exact schema may evolve during implementation.

---

# 17. Text Processing

Before indexing, documents must be normalized.

Example:

```text
React Hooks: A Beginner's Guide!
```

may become:

```text
react
hooks
a
beginner
s
guide
```

The processing pipeline can include:

```text
Raw Text
 ↓
Lowercase
 ↓
Tokenization
 ↓
Punctuation handling
 ↓
Whitespace normalization
 ↓
Optional stop-word removal
 ↓
Normalized tokens
```

V1 should avoid excessive linguistic complexity.

Stemming can be considered only if it improves the observed search quality.

---

# 18. Inverted Index

The inverted index is the central search data structure.

Instead of searching every document:

```text
document 1
document 2
document 3
...
document 5000
```

for every query, QueryX creates:

```text
term → documents containing term
```

Example:

```text
react →
    doc 1
    doc 5
    doc 17

hooks →
    doc 5
    doc 17
    doc 30
```

The index can be represented using TypeScript `Map` structures.

For V1, the index can remain in memory after being built from SQLite.

---

# 19. Field-Aware Postings

Field information must be preserved during indexing because ranking will treat different fields differently.

A posting should look conceptually like:

```ts
type Posting = {
    docId: number;
    titleTF: number;
    headingTF: number;
    bodyTF: number;
};
```

Example:

```text
react →

doc 5
    titleTF   = 1
    headingTF = 2
    bodyTF    = 4

doc 17
    titleTF   = 0
    headingTF = 1
    bodyTF    = 8
```

This allows ranking to distinguish:

```text
"react" in title
```

from:

```text
"react" once in body text
```

without requiring the HTML to be parsed again.

V1 does not require a positional index.

---

# 20. Query Processing

A query follows the same normalization pipeline as documents.

Example:

```text
"React Hooks!"
```

becomes:

```text
["react", "hooks"]
```

Each term is looked up in the inverted index.

For example:

```text
react → {1, 5, 17, 42}
hooks → {5, 17, 30}
```

The engine creates candidate documents from these postings.

Documents that match more query terms can receive higher scores.

---

# 21. Ranking

The initial ranking algorithm is TF-IDF.

## Term Frequency

A simple TF value can be based on the number of times a term appears in a field.

Conceptually:

```text
TF(term, document)
```

## Document Frequency

The number of documents containing a term:

```text
DF(term)
```

## Inverse Document Frequency

A common form is:

```text
IDF(term) = log(N / DF(term))
```

where:

```text
N = total number of documents
```

The exact smoothed formula can be selected during implementation.

## TF-IDF

A basic relevance contribution is:

```text
TF-IDF = TF × IDF
```

Multiple query terms can contribute to the document score.

---

# 22. Field Boosting

QueryX preserves title, heading, and body term frequencies.

A conceptual ranking model is:

```text
score =
    title contribution × title boost
  + heading contribution × heading boost
  + body contribution × body boost
```

For example:

```text
Title   × 3
Heading × 2
Body    × 1
```

These are initial tuning values, not fixed mathematical truths.

They should be evaluated using real queries.

BM25 may later replace TF-IDF while keeping the same field-aware index.

---

# 23. Top-K Min-Heap

Suppose:

```text
1,000 candidate documents
```

but only:

```text
10 results
```

are needed.

A full sort would be:

```text
Score all candidates
        ↓
Sort all candidates
        ↓
Take first 10
```

QueryX instead maintains a Min-Heap of size K:

```text
candidate
   ↓
calculate score
   ↓
heap size < K?
   ↓
insert
   ↓
otherwise compare against minimum
   ↓
replace if better
```

This provides a practical application for the Priority Queue / Min-Heap data structure.

---

# 24. Snippet Generation

Search results should display a small relevant section of the document.

Example:

```text
React Hooks – React Documentation
https://react.dev/reference/react/hooks

Hooks let you use state and other React features
without writing a class...
```

V1 snippet generation can remain simple.

The algorithm can:

1. Normalize query terms.
2. Search for a matching occurrence in the stored text.
3. Find a surrounding character window.
4. Return a short excerpt.

For example:

```text
±150 characters
```

around a relevant match.

A positional index is not required for V1.

If benchmarks show that snippet generation becomes expensive, sentence boundaries or term positions can be investigated later.

---

# 25. Trie Autocomplete

QueryX uses a Trie for prefix-based term suggestions.

Example:

```text
        root
         |
         r
         |
         e
       /   \
      a     d
      |
      c
      |
      t
```

Typing:

```text
rea
```

can produce:

```text
react
reactive
reaction
```

The Trie should be built from the indexed vocabulary.

## Phrase suggestions

A pure word Trie cannot naturally produce:

```text
react hooks
react router
```

from individual tokens alone.

Therefore V1 can maintain a lightweight second suggestion source using:

- document titles
- headings

For example:

```text
React Hooks
React Router
React Server Components
```

This allows phrase-style suggestions without generating a huge collection of every possible n-gram.

---

# 26. Next.js Application

Next.js provides the local search interface.

The main page should contain:

```text
QueryX

[ Search query........................ ]

[autocomplete suggestions]

-----------------------------------------

Result title
URL
Snippet

Result title
URL
Snippet
```

The frontend can also show:

```text
Documents indexed: 1,247
Search time: 18 ms
```

These metrics are useful during development and benchmarking.

---

# 27. Index Lifecycle and Runtime State

The document database is persistent.

The in-memory search index is derived from SQLite.

The intended lifecycle is:

```text
Crawler
   ↓
SQLite
   ↓
Indexer
   ↓
In-memory Inverted Index + Trie
   ↓
Search API
```

The crawler and indexer should be explicit operations rather than being triggered every time the web application starts.

For example:

```bash
npm run crawl
npm run index
npm run dev
```

In Next.js development mode, module reloads can recreate module-level state.

Therefore QueryX should use a development-safe singleton strategy for the in-memory search engine where necessary.

A global singleton can prevent accidental duplication during Fast Refresh.

A separate search process is intentionally not required for V1.

If runtime constraints become a genuine bottleneck, process separation can be investigated in a later version.

---

# 28. Configuration

Crawler configuration should be centralized.

Example:

```ts
export const crawlerConfig = {
    maxPages: 100,
    maxDepth: 2,
    maxPagesPerDomain: 50,

    requestDelayMs: 1000,
    requestTimeoutMs: 10000,

    maxResponseSizeBytes: 5 * 1024 * 1024,

    seeds: [
        "https://developer.mozilla.org/",
        "https://react.dev/"
    ]
};
```

The initial configuration should be conservative.

The limits can later be increased after testing.

---

# 29. Installation

Create the project with Next.js and TypeScript.

Then install the crawler and storage dependencies:

```bash
npm install htmlparser2 robots-parser better-sqlite3
```

Install TypeScript types for SQLite:

```bash
npm install -D @types/better-sqlite3
```

The exact package versions should be determined by the project's `package.json` and lockfile.

---

# 30. Running QueryX

The intended workflow is:

### Start with a small crawl

```bash
npm run crawl
```

This should:

```text
Seed URLs
   ↓
Crawler
   ↓
SQLite
```

### Build the index

```bash
npm run index
```

This should:

```text
SQLite
   ↓
Indexer
   ↓
Inverted Index + Trie
```

### Start the frontend

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

The exact npm scripts will be defined during implementation.

---

# 31. Development Workflow

QueryX should be developed incrementally.

Do not implement the entire search engine before testing individual components.

Recommended order:

```text
Phase 0
Project Setup
     ↓
Phase 1
URL Canonicalization
     ↓
Phase 2
Crawler
     ↓
Phase 3
HTML Parser
     ↓
Phase 4
SQLite
     ↓
Phase 5
Text Processing
     ↓
Phase 6
Inverted Index
     ↓
Phase 7
Query + Ranking
     ↓
Phase 8
Top-K + Snippets
     ↓
Phase 9
Trie
     ↓
Phase 10
Next.js UI
     ↓
Phase 11
Integration
     ↓
Benchmark
```

Each phase should have a working test before moving forward.

---

# 32. Testing Strategy

Testing should focus on correctness of the individual components.

## URL Canonicalization

Test:

```text
trailing slash
fragment removal
relative URLs
absolute URLs
tracking parameters
invalid URLs
```

## Queue

Test:

```text
FIFO behavior
empty queue
multiple insertions
```

## Visited Set

Test:

```text
duplicate URL
canonicalized duplicates
```

## Parser

Use saved HTML fixtures.

Verify:

```text
title
headings
body
links
```

## Tokenizer

Test:

```text
punctuation
uppercase
whitespace
numbers
special characters
```

## Inverted Index

Given:

```text
doc 1: React Hooks
doc 2: React Router
```

verify:

```text
react → doc 1, doc 2
hooks → doc 1
router → doc 2
```

## Trie

Test:

```text
insert
search
prefix search
missing prefix
```

## Ranking

Create small controlled documents where expected ordering is obvious from the scoring rules.

## Min-Heap

Test:

```text
K = 3
many scored documents
```

and verify that only the three highest scores remain.

---

# 33. Benchmarking

Benchmarking is an important part of QueryX.

The system should be tested at increasing corpus sizes.

## Dataset 1

```text
100 documents
```

Measure:

- Crawl time
- Database size
- Index build time
- Index memory
- Search latency

## Dataset 2

```text
1,000 documents
```

Repeat the measurements.

## Dataset 3

```text
2,000–5,000 documents
```

Repeat if the system remains stable.

Example benchmark table:

| Metric | 100 | 1,000 | 5,000 |
|---|---:|---:|---:|
| Crawl time | | | |
| SQLite size | | | |
| Index build time | | | |
| Index memory | | | |
| Search latency | | | |
| Autocomplete latency | | | |

The benchmark should guide future architectural decisions.

---

# 34. Performance Expectations

QueryX V1 is not designed for millions of pages.

The intended scale is:

```text
~1,000 pages initially
~2,000–5,000 pages eventually
```

At this scale:

- SQLite is sufficient.
- An in-memory Map-based index is reasonable.
- A Trie is reasonable.
- A single-machine crawler is sufficient.
- A simple Min-Heap is sufficient.

The project should not introduce more infrastructure simply because production search engines use it.

---

# 35. Failure Handling

The crawler should expect failures.

Possible failures include:

- DNS errors
- connection errors
- timeout
- HTTP 404
- HTTP 403
- HTTP 429
- HTTP 500
- malformed HTML
- oversized response
- unsupported content type
- invalid URL
- robots.txt restrictions

A failed URL should not crash the entire crawl.

The crawler should record or log the failure and continue with other tasks where appropriate.

---

# 36. V1 Milestones

## Milestone 1 — Project Setup

The project runs successfully.

```text
Next.js
SQLite dependency
crawler structure
```

---

## Milestone 2 — URL System

Working:

```text
canonicalizeUrl()
Queue
Visited Set
```

---

## Milestone 3 — Basic Crawler

QueryX can:

```text
Seed
→ fetch
→ parse links
→ queue links
→ crawl multiple pages
```

---

## Milestone 4 — Safe Crawler

Add:

```text
robots.txt
depth limit
domain limit
page limit
timeouts
response limits
delay
```

---

## Milestone 5 — Document Store

Real pages are stored in SQLite.

---

## Milestone 6 — Indexer

SQLite documents become:

```text
Inverted Index
```

with field-aware postings.

---

## Milestone 7 — Search

QueryX can:

```text
query
→ retrieve
→ score
→ rank
→ return results
```

---

## Milestone 8 — Top-K

Ranking uses a Min-Heap to maintain the best K results.

---

## Milestone 9 — Snippets

Results contain useful text excerpts.

---

## Milestone 10 — Autocomplete

Trie-based prefix suggestions work.

---

## Milestone 11 — UI

The complete search interface works.

---

## Milestone 12 — Benchmark

The system is tested at:

```text
100
1,000
2,000–5,000
```

documents.

---

# 37. V1 Acceptance Criteria

QueryX V1 is considered complete when the following workflow works:

### Crawling

```text
npm run crawl
```

successfully discovers and stores a controlled collection of real webpages.

### Storage

SQLite contains documents with:

```text
URL
Title
Headings
Text
Metadata
```

### Indexing

```text
npm run index
```

creates:

```text
Field-aware inverted index
Trie
```

### Search

A query such as:

```text
react hooks
```

produces ranked results.

### Ranking

Results are scored using:

```text
TF-IDF
```

or the implemented BM25 upgrade.

Title and heading matches can influence relevance.

### Top-K

The engine uses a Min-Heap / Priority Queue to maintain the best K results.

### Snippets

Results contain relevant text excerpts.

### Autocomplete

Typing:

```text
rea
```

produces relevant suggestions.

### UI

The complete flow works from:

```text
Browser
→ Search Box
→ API
→ Search Engine
→ Results
```

### Persistence

Restarting the application does not delete crawled documents.

---

# 38. Future V2 Ideas

V2 features should only be introduced when V1 measurements or real search-quality limitations justify them.

Possible extensions include:

## Persistent Index

If the inverted index becomes too large for memory:

```text
Memory Index
     ↓
Persistent Segments
```

could be investigated.

---

## Radix Tree

If Trie memory consumption becomes significant:

```text
Trie
 ↓
Radix Tree
```

could reduce redundant prefix nodes.

---

## Better Ranking

Possible upgrades:

```text
TF-IDF
 ↓
BM25
 ↓
Field-aware BM25
```

---

## PageRank

If link structure becomes useful:

```text
Web Graph
 ↓
PageRank
 ↓
Ranking Boost
```

---

## Positional Index

If phrase search becomes necessary:

```text
term
 ↓
document
 ↓
positions
```

could be introduced.

---

## Spelling Correction

A future version could support:

```text
react hoks
     ↓
react hooks
```

using edit distance or another spelling model.

---

## Semantic Search

A much later version could investigate:

```text
Documents
 ↓
Embeddings
 ↓
Vector Search
```

This is intentionally outside V1.

---

## Distributed Crawling

Only if corpus size genuinely demands it:

```text
Crawler Coordinator
        ↓
Workers
        ↓
Distributed Frontier
```

This is a future systems-design exercise, not part of the initial project.

---

# 39. Design Principles

QueryX follows several principles.

## 1. Build the smallest useful system

Every feature should have a clear purpose.

---

## 2. Prefer real bottlenecks over imagined bottlenecks

Do not introduce:

```text
Redis
Kafka
C++
distributed workers
```

because large systems use them.

Introduce them only when QueryX demonstrates a problem that requires them.

---

## 3. Preserve information early

The index must preserve information required by later stages.

For example:

```text
title
heading
body
```

must remain distinguishable because ranking needs field information.

---

## 4. Separate persistent data from derived data

SQLite contains the source documents.

The inverted index and Trie are derived structures.

Conceptually:

```text
SQLite
   ↓
Derived Search Structures
```

This allows the search structures to be rebuilt.

---

## 5. Make every DSA meaningful

A data structure should exist because it solves a real problem.

Not because it looks impressive in a README.

---

## 6. Measure before optimizing

The benchmark determines the next architectural decision.

---

# 40. Learning Objectives

By completing QueryX V1, the developer should understand:

### Data Structures

- Queue
- HashSet
- HashMap / Map
- Trie
- Min-Heap
- Graph concepts

### Algorithms

- Breadth-first crawling
- URL canonicalization
- Tokenization
- Index construction
- Candidate retrieval
- TF-IDF
- BM25
- Top-K selection

### Databases

- SQLite
- schema design
- constraints
- indexes
- persistence
- querying

### Web Systems

- HTTP
- URLs
- redirects
- content types
- robots.txt
- crawling
- HTML parsing

### Search Engines

- documents
- terms
- inverted indexes
- postings
- TF
- DF
- IDF
- ranking
- snippets
- autocomplete

### Software Architecture

- modular design
- data pipelines
- persistent vs derived state
- runtime state
- benchmarking
- incremental optimization

The ultimate learning objective is to understand how the individual pieces combine into a functioning search system rather than merely implementing isolated algorithms.

---

# 41. License and Responsible Crawling

QueryX is intended as a local educational project.

The crawler should operate conservatively.

It should:

- respect `robots.txt`
- use reasonable request delays
- limit crawl depth
- limit pages per domain
- avoid unnecessary requests
- ignore unsupported large resources
- stop when configured limits are reached

The seed domains should be chosen carefully, and their crawling policies should be respected.

QueryX should not be used to aggressively crawl websites or bypass access controls, rate limits, authentication, or other restrictions.

---

# Final Architecture

The final V1 system can be summarized as:

```text
                    QUERYX V1
                        │
          ┌─────────────┴─────────────┐
          │                           │
       CRAWLING                  SEARCH UI
          │                           │
     Seed URLs                    Next.js
          │                           │
     URL Frontier               Search Box
          │                           │
    Queue + HashSet            Autocomplete
          │                           │
 URL Canonicalization                │
          │                           │
 Per-Domain Scheduling               │
          │                           │
      robots.txt                     │
          │                           │
       HTTP Fetch                    │
          │                           │
    htmlparser2                      │
          │                           │
 ┌────────┼─────────┐                 │
 │        │         │                 │
Title  Headings    Body               │
 └────────┼─────────┘                 │
          │                           │
        SQLite                        │
          │                           │
       Indexer                        │
          │                           │
 ┌────────┴─────────┐                 │
 │                  │                 │
Inverted Index      Trie              │
 │                  │                 │
 │              Suggestions           │
 │                                    │
 Query Processing                     │
 │                                    │
 Candidate Retrieval                  │
 │                                    │
 TF-IDF / BM25                        │
 │                                    │
 Field Boosting                       │
 │                                    │
 Min-Heap Top-K                       │
 │                                    │
 SQLite Metadata                      │
 │                                    │
 Snippet Generation                   │
 │                                    │
 └───────────────→ Search API ────────┘
                         │
                         ▼
                   Ranked Results
```

QueryX V1 is deliberately small enough to finish, but large enough to demonstrate a complete real-world search-engine pipeline.

The guiding principle is:

> **Build the fundamental system first. Measure it. Then let real bottlenecks determine what comes next.**
