
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { db } from "../storage/database";

const builtIndex = buildIndex();
const index = builtIndex.index;

console.log("Indexed terms:", index.size);
console.log("Total documents:", builtIndex.totalDocuments);

const result = processQuery("react hooks", index);

console.log("\nQuery:");
console.log(result.query);

console.log("\nTerms:");
console.log(result.terms);

console.log("\nTerm results:");

for (const termResult of result.results) {
  console.log(`\n${termResult.term}`);
  console.log("Document frequency:", termResult.postings.length);
  console.log("Postings:", termResult.postings);
}

console.log("\nCandidate documents:");
console.log(result.candidateDocIds);

db.close();
