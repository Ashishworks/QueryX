
import { buildIndex } from "../indexer/build-index";
import { buildTrie } from "../indexer/build-trie";

const index = buildIndex();
const trie = buildTrie(index);

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 10;

export function getSuggestions(
    query: string,
    limit = DEFAULT_LIMIT
): string[] {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
        return [];
    }

    const safeLimit = Math.min(
        Math.max(1, Math.floor(limit)),
        MAX_LIMIT
    );

    const lastSpaceIndex = trimmedQuery.lastIndexOf(" ");
    const completedText = trimmedQuery.slice(0, lastSpaceIndex + 1);
    const currentPrefix = trimmedQuery.slice(lastSpaceIndex + 1).toLowerCase();

    if (!currentPrefix) {
        return [];
    }
    const matchingTerms = trie
        .suggest(currentPrefix, 100)
        .filter(
            (term) =>
                term.length >= 3 &&
                term !== currentPrefix
        )
        .sort((a, b) => {
            const frequencyA = index.get(a)?.length ?? 0;
            const frequencyB = index.get(b)?.length ?? 0;

            return frequencyB - frequencyA || a.localeCompare(b);
        })
        .slice(0, safeLimit);

    return matchingTerms.map((term) => `${completedText}${term}`);
}
