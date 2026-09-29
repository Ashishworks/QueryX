import { db } from "../storage/database";
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { rankDocuments } from "./ranking";
import { getTopK } from "./top-k";

const index = buildIndex();

const totalDocuments = (
  db
    .prepare("SELECT COUNT(*) as count FROM documents")
    .get() as { count: number }
).count;

const queryResult = processQuery(
  "react hooks",
  index
);

const rankedResults = rankDocuments(
  queryResult,
  index,
  totalDocuments
);

const topResults = getTopK(
  rankedResults,
  5
);

console.log("Total documents:", totalDocuments);

console.log("\nQuery:");
console.log(queryResult.query);

console.log("\nTop 5 results:");

for (const result of topResults) {
  console.log(
    `doc ${result.docId} → score ${result.score.toFixed(4)}`
  );
}