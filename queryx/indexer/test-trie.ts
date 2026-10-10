import { Trie } from "./trie";

const trie = new Trie();

trie.insert("react");
trie.insert("reactive");
trie.insert("react-router");
trie.insert("redis");
trie.insert("request");

console.log("rea:", trie.suggest("rea", 5));
console.log("rea limit 2:", trie.suggest("rea", 2));
console.log("red:", trie.suggest("red", 5));
console.log("xyz:", trie.suggest("xyz", 5));
console.log("empty:", trie.suggest("", 5));