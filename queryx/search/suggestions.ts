import { buildIndex } from "../indexer/build-index";
import { buildTrie } from "../indexer/build-trie";

const index = buildIndex();
const trie = buildTrie(index);

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;

export function getSuggestions(
  prefix: string,
  limit = DEFAULT_LIMIT
): string[] {
  const normalizedPrefix = prefix
    .toLowerCase()
    .trim();

  if (!normalizedPrefix) {
    return [];
  }

  const safeLimit = Math.min(
    Math.max(1, Math.floor(limit)),
    MAX_LIMIT
  );

  return trie.suggest(normalizedPrefix, safeLimit);
}