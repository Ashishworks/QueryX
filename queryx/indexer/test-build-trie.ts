import { buildIndex } from "./build-index";
import { buildTrie } from "./build-trie";

const index = buildIndex();
const trie = buildTrie(index);

console.log("Indexed vocabulary size:", index.size);
console.log('Suggestions for "rea":', trie.suggest("rea", 10));
console.log('Suggestions for "use":', trie.suggest("use", 10));
console.log('Suggestions for "xyz":', trie.suggest("xyz", 10));