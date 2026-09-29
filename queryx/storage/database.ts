import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { ParsedDocument } from "../crawler/parser";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const dbPath = path.join(dataDirectory, "queryx.db");

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    headings TEXT NOT NULL,
    text TEXT NOT NULL,
    crawled_at TEXT NOT NULL
  );
`);

const insertDocumentStatement = db.prepare(`
  INSERT INTO documents (
    url,
    title,
    headings,
    text,
    crawled_at
  )
  VALUES (
    @url,
    @title,
    @headings,
    @text,
    @crawledAt
  )
  ON CONFLICT(url) DO UPDATE SET
    title = excluded.title,
    headings = excluded.headings,
    text = excluded.text,
    crawled_at = excluded.crawled_at
`);

export function saveDocument(
  document: ParsedDocument
): void {
  insertDocumentStatement.run({
    url: document.url,
    title: document.title,
    headings: JSON.stringify(document.headings),
    text: document.text,
    crawledAt: new Date().toISOString(),
  });
}