import type { InvertedIndex } from "./inverted-index";
import { Trie } from "./trie";

export function buildTrie(index: InvertedIndex): Trie {
  const trie = new Trie();

  for (const term of index.keys()) {
    trie.insert(term);
  }

  return trie;
}