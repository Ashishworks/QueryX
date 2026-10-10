
import { buildIndex } from "./build-index";
import { buildTrie } from "./build-trie";
import { db } from "../storage/database";

const builtIndex = buildIndex();
const index = builtIndex.index;
const trie = buildTrie(index);

console.log("Total documents:", builtIndex.totalDocuments);
console.log("Indexed vocabulary size:", index.size);

console.log('Suggestions for "rea":', trie.suggest("rea", 10));
console.log('Suggestions for "use":', trie.suggest("use", 10));
console.log('Suggestions for "xyz":', trie.suggest("xyz", 10));

db.close();
