
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { rankDocuments } from "./ranking";
import { getTopK } from "./top-k";
import { getSearchResults } from "./snippets";

const builtIndex = buildIndex();

const TOP_K = 10;

export function search(query: string) {
  const queryResult = processQuery(
    query,
    builtIndex.index
  );

  const rankedResults = rankDocuments(
    queryResult,
    builtIndex.totalDocuments,
    builtIndex.documentStats,
    {
      title: builtIndex.averageTitleLength,
      heading: builtIndex.averageHeadingLength,
      body: builtIndex.averageBodyLength,
    }
  );

  const topResults = getTopK(
    rankedResults,
    TOP_K
  );

  return getSearchResults(
    topResults,
    queryResult.terms
  );
}
