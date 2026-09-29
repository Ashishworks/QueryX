import { fetchPage } from "./fetcher";

async function main() {
  const html = await fetchPage("https://react.dev");

  if (html) {
    console.log("Successfully fetched page!");
    console.log("HTML length:", html.length);
    console.log("First 500 characters:");
    console.log(html.slice(0, 500));
  } else {
    console.log("Failed to fetch page.");
  }
}

main();