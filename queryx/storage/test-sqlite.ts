import Database from "better-sqlite3";

console.log("1. Starting");

const db = new Database("test.db");

console.log("2. Database opened");

db.exec(`
  CREATE TABLE IF NOT EXISTS test (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

console.log("3. Table created");

const insert = db.prepare(
  "INSERT INTO test (name) VALUES (?)"
);

insert.run("QueryX");

console.log("4. Inserted");

const rows = db
  .prepare("SELECT * FROM test")
  .all();

console.log("5. Rows:", rows);

db.close();

console.log("6. Database closed");
