import { db } from "../storage/database";
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { rankDocuments } from "./ranking";
import { getTopK } from "./top-k";
import { getSearchResults } from "./snippets";

const index = buildIndex();

const totalDocuments = (
  db
    .prepare("SELECT COUNT(*) as count FROM documents")
    .get() as { count: number }
).count;

const queryResult = processQuery(
  "javascript promises",
  index
);

const rankedResults = rankDocuments(
  queryResult,
  totalDocuments
);

const topResults = getTopK(
  rankedResults,
  5
);

const searchResults = getSearchResults(
  topResults,
  queryResult.terms
);

console.log("Total documents:", totalDocuments);

console.log("\nQuery:");
console.log(queryResult.query);

console.log("\nSearch results:");

for (const result of searchResults) {
  console.log("\n-----------------------------");

  console.log("Doc ID:", result.docId);
  console.log("Title:", result.title);
  console.log("URL:", result.url);
  console.log("Score:", result.score.toFixed(4));
  console.log("Snippet:", result.snippet);
}