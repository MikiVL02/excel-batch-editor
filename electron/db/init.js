const Database = require("better-sqlite3");
const path = require("path");
const { app } = require("electron");
const fs = require("fs");

const DB_DIR = path.join(app.getPath("userData"), "excel-batch-editor");
fs.mkdirSync(DB_DIR, { recursive: true });
const DB_PATH = path.join(DB_DIR, "app.db");

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grp TEXT DEFAULT '',
    file_path TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS fields (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    sheet TEXT NOT NULL,
    cell TEXT NOT NULL,
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS generation_records (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    output_dir TEXT NOT NULL,
    row_count INTEGER NOT NULL
  );
`);

module.exports = db;
