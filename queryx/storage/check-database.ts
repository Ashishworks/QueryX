import { db } from "./database";

const documents = db
  .prepare(`
    SELECT
      id,
      url,
      title,
      LENGTH(text) AS text_length
    FROM documents
    ORDER BY id
  `)
  .all();

console.table(documents);

db.close();