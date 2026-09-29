import { canCrawl } from "./robots";

async function main() {
  const urls = [
    "https://react.dev/",
    "https://react.dev/learn",
  ];

  for (const url of urls) {
    const allowed = await canCrawl(url);

    console.log(url, "→", allowed);
  }
}

main();