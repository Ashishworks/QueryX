import { tokenize } from "../indexer/tokenizer";
import {
  type InvertedIndex,
  type Posting,
} from "../indexer/inverted-index";

export type QueryTermResult = {
  term: string;
  postings: Posting[];
};

export type QueryResult = {
  query: string;
  terms: string[];
  results: QueryTermResult[];
  candidateDocIds: number[];
};

export function processQuery(
  query: string,
  index: InvertedIndex
): QueryResult {
  const terms = tokenize(query);

  const results: QueryTermResult[] = [];
  const candidateDocIds = new Set<number>();

  for (const term of terms) {
    const postings = index.get(term) ?? [];

    results.push({
      term,
      postings,
    });

    for (const posting of postings) {
      candidateDocIds.add(posting.docId);
    }
  }

  return {
    query,
    terms,
    results,
    candidateDocIds: [...candidateDocIds],
  };
}