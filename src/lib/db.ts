import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'iconoclast.db')

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

let db: Database.Database

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
    initSchema(db)
  }
  return db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS landing_videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      youtube_url TEXT NOT NULL,
      title TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS moodboard_photos (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      alt_text TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bio (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      image_path TEXT,
      image_name TEXT,
      bio_text TEXT,
      updated_at INTEGER NOT NULL
    );

    INSERT OR IGNORE INTO bio (id, updated_at) VALUES (1, ${Date.now()});

    CREATE TABLE IF NOT EXISTS collaborators (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS directors_bg_video (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      file_path TEXT,
      file_name TEXT,
      mime_type TEXT,
      size INTEGER,
      updated_at INTEGER NOT NULL
    );

    INSERT OR IGNORE INTO directors_bg_video (id, updated_at) VALUES (1, ${Date.now()});
  `)
}
