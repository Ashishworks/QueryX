import { db } from "../storage/database";
import { buildIndex } from "../indexer/build-index";
import { processQuery } from "./query";
import { rankDocuments } from "./ranking";
import { getTopK } from "./top-k";
import { getSearchResults } from "./snippets";

const index = buildIndex();

const totalDocuments = (
  db
    .prepare("SELECT COUNT(*) as count FROM documents")
    .get() as { count: number }
).count;

const TOP_K = 10;

export function search(query: string) {
  const queryResult = processQuery(query, index);

  const rankedResults = rankDocuments(
    queryResult,
    totalDocuments
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