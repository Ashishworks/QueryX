export const crawlerConfig = {
  maxPages: 500,
  maxDepth: 3,
  maxPagesPerDomain: 100,

  requestDelayMs: 1000,
  requestTimeoutMs: 10000,

  maxResponseSizeBytes: 5 * 1024 * 1024,

  seeds: [
    "https://developer.mozilla.org/",
    "https://react.dev/",
    "https://nextjs.org/docs",
    "https://www.typescriptlang.org/docs/",
    "https://nodejs.org/docs/latest/api/",
  ],
};