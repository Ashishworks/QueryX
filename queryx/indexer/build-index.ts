import { db } from "../storage/database";
import { tokenize } from "./tokenizer";
import {
  addDocument,
  type InvertedIndex,
} from "./inverted-index";

export function buildIndex(): InvertedIndex {
  const index: InvertedIndex = new Map();

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

  for (const document of documents) {
    const titleTokens = tokenize(document.title);

    const headings = JSON.parse(
      document.headings
    ) as string[];

    const headingTokens = tokenize(
      headings.join(" ")
    );

    const bodyTokens = tokenize(document.text);

    addDocument(
      index,
      document.id,
      titleTokens,
      headingTokens,
      bodyTokens
    );
  }

  return index;
}