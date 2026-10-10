
import { db } from "../storage/database";
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { rankDocuments } from "./ranking";
import { getTopK } from "./top-k";
import { getSearchResults } from "./snippets";

const builtIndex = buildIndex();

const queries = [
  "react hooks",
  "javascript promises",
  "node http",
  "xyznonexistent",
];

console.log("Total documents:", builtIndex.totalDocuments);

for (const query of queries) {
  const queryResult = processQuery(query, builtIndex.index);

  const rankedResults = rankDocuments(
    queryResult,
    builtIndex.totalDocuments,
    builtIndex.documentStats,
    {
      title: builtIndex.averageTitleLength,
      heading: builtIndex.averageHeadingLength,
      body: builtIndex.averageBodyLength,
    }
  );

  const topResults = getTopK(rankedResults, 5);
  const searchResults = getSearchResults(topResults, queryResult.terms);

  console.log("\n================================");
  console.log("Query:", query);
  console.log("Results:", searchResults.length);

  for (const result of searchResults) {
    console.log("\n-----------------------------");
    console.log("Title:", result.title);
    console.log("Score:", result.score.toFixed(4));
    console.log("URL:", result.url);
  }
}

db.close();
