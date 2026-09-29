const MAX_DEPTH = 3;
const MAX_PAGES_PER_DOMAIN = 500;

const domainPageCounts = new Map<string, number>();
const lastRequestTime = new Map<string, number>();

const REQUEST_DELAY = 1000; // 1 second

export function canCrawlDepth(depth: number): boolean {
  return depth <= MAX_DEPTH;
}

export function canCrawlDomain(url: string): boolean {
  const domain = new URL(url).hostname;

  const count = domainPageCounts.get(domain) ?? 0;

  return count < MAX_PAGES_PER_DOMAIN;
}

export function recordCrawl(url: string): void {
  const domain = new URL(url).hostname;

  const current = domainPageCounts.get(domain) ?? 0;

  domainPageCounts.set(domain, current + 1);
}

export async function waitForDomain(url: string): Promise<void> {
  const domain = new URL(url).hostname;

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