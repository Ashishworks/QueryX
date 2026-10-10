
import { buildIndex } from "./build-index";
import { db } from "../storage/database";

const builtIndex = buildIndex();
const index = builtIndex.index;

console.log("Total documents:", builtIndex.totalDocuments);
console.log("Indexed terms:", index.size);

console.log("\nAverage title length:", builtIndex.averageTitleLength);
console.log("Average heading length:", builtIndex.averageHeadingLength);
console.log("Average body length:", builtIndex.averageBodyLength);

console.log("\nReact postings:");
console.log(index.get("react"));

console.log("\nReact document statistics:");

for (const posting of index.get("react") ?? []) {
  console.log(builtIndex.documentStats.get(posting.docId));
}

db.close();
