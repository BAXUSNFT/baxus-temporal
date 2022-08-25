import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

sqlite3.verbose();
let db: Database = undefined as any;

(async () => {
  db = await open({
    filename: "/tmp/database.db",
    driver: sqlite3.Database,
  });
  db.exec(`
    CREATE TABLE IF NOT EXISTS greets (
        greet_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        workflow_id TEST NOT NULL UNIQUE,
        name TEXT NOT NULL UNIQUE,
        greeting text NULL
    );`);
})();

export interface greets {
  greet_id: number;
  workflow_id: string;
  name: string;
  greeting: string;
}

export const insert_greet = async (wfID: string, name: string) => {
  const stmt = await db.prepare(
    `INSERT INTO greets(workflow_id, name) VALUES(@wf_id, @name);`
  );
  await stmt.bind({ "@wf_id": wfID, "@name": name });
  return await stmt.get<greets>();
};

export const select_greet = async (name: string) => {
  const stmt = await db.prepare(`SELECT * FROM greets WHERE name = @name;`);
  await stmt.bind({ "@name": name });
  return await stmt.get<greets>();
};

export const update_greet = async (name: string, greeting: string) => {
  const stmt = await db.prepare(
    `UPDATE greets SET greeting = @greeting WHERE name = @name;`
  );
  await stmt.bind({ "@name": name, "@greeting": greeting });
  return await stmt.get<greets>();
};

export const database = db;
