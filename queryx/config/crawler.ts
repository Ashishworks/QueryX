export const crawlerConfig = {
  maxPages: 100,
  maxDepth: 2,
  maxPagesPerDomain: 50,

  requestDelayMs: 1000,
  requestTimeoutMs: 10000,

  maxResponseSizeBytes: 5 * 1024 * 1024,

  seeds: [
    "https://developer.mozilla.org/",
    "https://react.dev/",
  ],
};