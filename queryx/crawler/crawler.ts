import { canonicalizeUrl } from "./canonicalize";
import { CrawlFrontier } from "./frontier";
import { fetchPage } from "./fetcher";
import { parseHtml } from "./parser";
import {
  canCrawlDepth,
  canCrawlDomain,
  recordCrawl,
  waitForDomain,
} from "./safety";
import { canCrawl } from "./robots";
import type { CrawlTask } from "./types";

export async function crawl(
  seeds: string[],
  maxPages: number
) {
  const frontier = new CrawlFrontier();

  // Add seed URLs
  for (const seed of seeds) {
    const canonicalUrl = canonicalizeUrl(seed);

    if (!canonicalUrl) {
      console.log(`Invalid seed URL: ${seed}`);
      continue;
    }

    frontier.add({
      url: canonicalUrl,
      depth: 0,
    });
  }

  let crawledPages = 0;

  while (!frontier.isEmpty && crawledPages < maxPages) {
    const task = frontier.next();

    if (!task) {
      break;
    }

    const { url, depth } = task;

    console.log(
      `\n[${crawledPages + 1}/${maxPages}] Crawling: ${url}`
    );

    // Depth safety
    if (!canCrawlDepth(depth)) {
      console.log("Skipped: maximum depth reached.");
      continue;
    }

    // Domain page limit
    if (!canCrawlDomain(url)) {
      console.log("Skipped: domain page limit reached.");
      continue;
    }

    // robots.txt
    const allowed = await canCrawl(url);

    if (!allowed) {
      console.log("Skipped: blocked by robots.txt.");
      continue;
    }

    // Respect per-domain delay
    await waitForDomain(url);

    // Fetch page
    const html = await fetchPage(url);

    if (!html) {
      continue;
    }

    // Record successful crawl
    recordCrawl(url);
    crawledPages++;

    // Parse HTML
    const document = parseHtml(html, url);

    console.log(`Title: ${document.title}`);
    console.log(`Links found: ${document.links.length}`);

    // Add discovered links
    for (const link of document.links) {
      if (!canCrawlDepth(depth + 1)) {
        continue;
      }

      frontier.add({
        url: link,
        depth: depth + 1,
      });
    }
  }

  console.log("\nCrawl complete.");
  console.log("Pages crawled:", crawledPages);
  console.log("Pages remaining in queue:", frontier.size);
}