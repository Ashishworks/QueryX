import { fetchPage } from "./fetcher";
import { parseHtml } from "./parser";

async function main() {
  const url = "https://react.dev";

  const html = await fetchPage(url);

  if (!html) {
    console.log("Failed to fetch page.");
    return;
  }

  const document = parseHtml(html, url);

  console.log("\nTITLE:");
  console.log(document.title);

  console.log("\nHEADINGS:");
  console.log(document.headings.slice(0, 10));

  console.log("\nLINKS:");
  console.log(document.links.slice(0, 10));

  console.log("\nTEXT LENGTH:");
  console.log(document.text.length);

  console.log("\nTEXT PREVIEW:");
  console.log(document.text.slice(0, 500));
}

main();