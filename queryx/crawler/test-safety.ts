import {
  canCrawlDepth,
  canCrawlDomain,
  recordCrawl,
  waitForDomain,
} from "./safety";

async function main() {
  console.log("Depth 0:", canCrawlDepth(0));
  console.log("Depth 3:", canCrawlDepth(3));
  console.log("Depth 4:", canCrawlDepth(4));

  const url = "https://react.dev/learn";

  console.log(
    "Can crawl domain:",
    canCrawlDomain(url)
  );

  console.log("Recording crawl...");
  recordCrawl(url);

  console.log(
    "Can crawl domain:",
    canCrawlDomain(url)
  );

  console.log("Testing request delay...");

  const start = Date.now();

  await waitForDomain(url);
  await waitForDomain(url);

  const elapsed = Date.now() - start;

  console.log("Elapsed:", elapsed, "ms");
}

main();