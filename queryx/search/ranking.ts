
import type { QueryResult } from "./query";
import type { DocumentStats } from "../indexer/inverted-index";

export type RankedDocument = {
  docId: number;
  score: number;
};

export type AverageFieldLengths = {
  title: number;
  heading: number;
  body: number;
};

const TITLE_WEIGHT = 3;
const HEADING_WEIGHT = 2;
const BODY_WEIGHT = 1;

const K1 = 1.2;
const B = 0.75;

function calculateIDF(
  totalDocuments: number,
  documentFrequency: number
): number {
  if (totalDocuments <= 0 || documentFrequency <= 0) {
    return 0;
  }

  return Math.log(
    1 +
      (totalDocuments - documentFrequency + 0.5) /
        (documentFrequency + 0.5)
  );
}

function calculateBM25TF(
  termFrequency: number,
  documentLength: number,
  averageDocumentLength: number
): number {
  if (termFrequency <= 0) {
    return 0;
  }

  const lengthNormalization =
    averageDocumentLength > 0
      ? 1 - B +
        B * (documentLength / averageDocumentLength)
      : 1;

  return (
    (termFrequency * (K1 + 1)) /
    (termFrequency + K1 * lengthNormalization)
  );
}

export function rankDocuments(
  queryResult: QueryResult,
  totalDocuments: number,
  documentStats: Map<number, DocumentStats>,
  averageLengths: AverageFieldLengths
): RankedDocument[] {
  const scores = new Map<number, number>();

  for (const termResult of queryResult.results) {
    const { postings } = termResult;
    const documentFrequency = postings.length;

    const idf = calculateIDF(
      totalDocuments,
      documentFrequency
    );

    for (const posting of postings) {
      const stats = documentStats.get(posting.docId);

      if (!stats) {
        continue;
      }

      const titleScore =
        TITLE_WEIGHT *
        calculateBM25TF(
          posting.titleTF,
          stats.titleLength,
          averageLengths.title
        );

      const headingScore =
        HEADING_WEIGHT *
        calculateBM25TF(
          posting.headingTF,
          stats.headingLength,
          averageLengths.heading
        );

      const bodyScore =
        BODY_WEIGHT *
        calculateBM25TF(
          posting.bodyTF,
          stats.bodyLength,
          averageLengths.body
        );

      const termScore =
        idf * (titleScore + headingScore + bodyScore);

      scores.set(
        posting.docId,
        (scores.get(posting.docId) ?? 0) + termScore
      );
    }
  }

  return [...scores.entries()]
    .map(([docId, score]) => ({ docId, score }))
    .sort((a, b) => b.score - a.score);
}
