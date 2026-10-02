const MAX_DEPTH = 3;
const MAX_PAGES_PER_DOMAIN = 100;

const ALLOWED_DOMAINS = new Set([
  "developer.mozilla.org",
  "react.dev",
  "nextjs.org",
  "typescriptlang.org",
  "www.typescriptlang.org",
  "nodejs.org",
]);

const domainPageCounts = new Map<string, number>();
const lastRequestTime = new Map<string, number>();

const REQUEST_DELAY = 1000;

export function canCrawlDepth(depth: number): boolean {
  return depth <= MAX_DEPTH;
}

export function canCrawlDomain(url: string): boolean {
  const domain = new URL(url).hostname.toLowerCase();

  if (!ALLOWED_DOMAINS.has(domain)) {
    return false;
  }

  const count = domainPageCounts.get(domain) ?? 0;

  return count < MAX_PAGES_PER_DOMAIN;
}

export function recordCrawl(url: string): void {
  const domain = new URL(url).hostname.toLowerCase();

  const current = domainPageCounts.get(domain) ?? 0;

  domainPageCounts.set(domain, current + 1);
}

export async function waitForDomain(url: string): Promise<void> {
  const domain = new URL(url).hostname.toLowerCase();

  const lastRequest = lastRequestTime.get(domain) ?? 0;
  const now = Date.now();
  const elapsed = now - lastRequest;

  if (elapsed < REQUEST_DELAY) {
    await new Promise((resolve) =>
      setTimeout(resolve, REQUEST_DELAY - elapsed)
    );
  }

  lastRequestTime.set(domain, Date.now());
}