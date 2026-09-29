import { buildIndex } from "./build-index";
import { db } from "../storage/database";

const index = buildIndex();

console.log("Indexed terms:", index.size);

console.log("\nReact postings:");

console.log(index.get("react"));

db.close();