import { db, saveDocument } from "./database";

console.log("1. Database imported");

saveDocument({
  url: "https://example.com",
  title: "Example Page",
  headings: ["Example Heading"],
  text: "This is a test document for QueryX.",
  links: [],
});

console.log("2. Document inserted");

const documents = db
  .prepare("SELECT * FROM documents")
  .all();

console.log("3. Documents:");
console.log(documents);

db.close();

console.log("4. Done");