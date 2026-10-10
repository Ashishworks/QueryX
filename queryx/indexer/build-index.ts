
import { db } from "../storage/database";
import { tokenize } from "./tokenizer";
import {
  addDocument,
  type DocumentStats,
  type InvertedIndex,
} from "./inverted-index";

export type BuiltIndex = {
  index: InvertedIndex;
  documentStats: Map<number, DocumentStats>;
  totalDocuments: number;
  averageTitleLength: number;
  averageHeadingLength: number;
  averageBodyLength: number;
};

export function buildIndex(): BuiltIndex {
  const index: InvertedIndex = new Map();
  const documentStats = new Map<number, DocumentStats>();

  const documents = db
    .prepare(`
      SELECT
        id,
        title,
        headings,
        text
      FROM documents
    `)
    .all() as {
      id: number;
      title: string;
      headings: string;
      text: string;
    }[];

  let totalTitleLength = 0;
  let totalHeadingLength = 0;
  let totalBodyLength = 0;

  for (const document of documents) {
    const titleTokens = tokenize(document.title);

    const headings = JSON.parse(
      document.headings
    ) as string[];

    const headingTokens = tokenize(headings.join(" "));
    const bodyTokens = tokenize(document.text);

    addDocument(
      index,
      document.id,
      titleTokens,
      headingTokens,
      bodyTokens
    );

    const stats: DocumentStats = {
      docId: document.id,
      titleLength: titleTokens.length,
      headingLength: headingTokens.length,
      bodyLength: bodyTokens.length,
    };

    documentStats.set(document.id, stats);

    totalTitleLength += stats.titleLength;
    totalHeadingLength += stats.headingLength;
    totalBodyLength += stats.bodyLength;
  }

  const totalDocuments = documents.length;

  return {
    index,
    documentStats,
    totalDocuments,
    averageTitleLength:
      totalDocuments > 0
        ? totalTitleLength / totalDocuments
        : 0,
    averageHeadingLength:
      totalDocuments > 0
        ? totalHeadingLength / totalDocuments
        : 0,
    averageBodyLength:
      totalDocuments > 0
        ? totalBodyLength / totalDocuments
        : 0,
  };
}
