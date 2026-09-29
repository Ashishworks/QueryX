import { getTopK } from "./top-k";

const documents = [
  { docId: 1, score: 10 },
  { docId: 2, score: 50 },
  { docId: 3, score: 20 },
  { docId: 4, score: 5 },
  { docId: 5, score: 40 },
  { docId: 6, score: 30 },
];

console.log("All documents:");
console.log(documents);

const top3 = getTopK(documents, 3);

console.log("\nTop 3:");
console.log(top3);