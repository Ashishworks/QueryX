import { db } from "../storage/database";

export type SearchResult = {
  docId: number;
  title: string;
  url: string;
  snippet: string;
  score: number;
};

function findMatchPosition(
  text: string,
  terms: string[]
): number {
  const lowerText = text.toLowerCase();

  let earliestPosition = -1;

  for (const term of terms) {
    const position = lowerText.indexOf(term.toLowerCase());

    if (
      position !== -1 &&
      (earliestPosition === -1 || position < earliestPosition)
    ) {
      earliestPosition = position;
    }
  }

  return earliestPosition;
}

export function generateSnippet(
  text: string,
  terms: string[],
  maxLength = 180
): string {
  if (!text || terms.length === 0) {
    return text.slice(0, maxLength);
  }

  const matchPosition = findMatchPosition(text, terms);

  if (matchPosition === -1) {
    return text.slice(0, maxLength);
  }

  const contextBefore = 60;
  const start = Math.max(
    0,
    matchPosition - contextBefore
  );

  const end = Math.min(
    text.length,
    start + maxLength
  );

  let snippet = text.slice(start, end).trim();

  if (start > 0) {
    snippet = "..." + snippet;
  }

  if (end < text.length) {
    snippet += "...";
  }

  return snippet;
}

export function getSearchResults(
  documents: {
    docId: number;
    score: number;
  }[],
  terms: string[]
): SearchResult[] {
  const getDocument = db.prepare(`
    SELECT
      id,
      url,
      title,
      text
    FROM documents
    WHERE id = ?
  `);

  return documents.flatMap((document) => {
    const row = getDocument.get(document.docId) as
      | {
          id: number;
          url: string;
          title: string;
          text: string;
        }
      | undefined;

    if (!row) {
      return [];
    }

    return [
      {
        docId: row.id,
        title: row.title,
        url: row.url,
        snippet: generateSnippet(row.text, terms),
        score: document.score,
      },
    ];
  });
}