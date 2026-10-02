import type { QueryResult } from "./query";

export type RankedDocument = {
  docId: number;
  score: number;
};

const TITLE_WEIGHT = 3;
const HEADING_WEIGHT = 2;
const BODY_WEIGHT = 1;

function calculateIDF(
  totalDocuments: number,
  documentFrequency: number
): number {
  if (documentFrequency === 0) {
    return 0;
  }

  return Math.log(totalDocuments / documentFrequency);
}

export function rankDocuments(
  queryResult: QueryResult,
  totalDocuments: number
): RankedDocument[] {
  const scores = new Map<number, number>();

  for (const termResult of queryResult.results) {
    const { term, postings } = termResult;

    const documentFrequency = postings.length;

    const idf = calculateIDF(
      totalDocuments,
      documentFrequency
    );

    for (const posting of postings) {
      const normalizedTitleTF =
        posting.titleTF > 0
          ? 1 + Math.log(posting.titleTF)
          : 0;

      const normalizedHeadingTF =
        posting.headingTF > 0
          ? 1 + Math.log(posting.headingTF)
          : 0;

      const normalizedBodyTF =
        posting.bodyTF > 0
          ? 1 + Math.log(posting.bodyTF)
          : 0;

      const weightedTF =
        normalizedTitleTF * TITLE_WEIGHT +
        normalizedHeadingTF * HEADING_WEIGHT +
        normalizedBodyTF * BODY_WEIGHT;

      const termScore = weightedTF * idf;

      scores.set(
        posting.docId,
        (scores.get(posting.docId) ?? 0) + termScore
      );
    }
  }

  return [...scores.entries()]
    .map(([docId, score]) => ({
      docId,
      score,
    }))
    .sort((a, b) => b.score - a.score);
}