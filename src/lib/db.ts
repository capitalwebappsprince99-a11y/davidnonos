import { createClient, Client } from '@libsql/client'

let client: Client | null = null
let initialized: Promise<void> | null = null

function createDbClient(): Client {
  return createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
}

async function initSchema(db: Client): Promise<void> {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS landing_videos (
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
    )`,
    `CREATE TABLE IF NOT EXISTS clips (
      id TEXT PRIMARY KEY,
      youtube_url TEXT NOT NULL,
      title TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS moodboard_photos (
      id TEXT PRIMARY KEY,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      alt_text TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS bio (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      image_path TEXT,
      image_name TEXT,
      bio_text TEXT,
      updated_at INTEGER NOT NULL
    )`,
    `INSERT OR IGNORE INTO bio (id, updated_at) VALUES (1, ${Date.now()})`,
    `CREATE TABLE IF NOT EXISTS collaborators (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS directors_bg_video (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      file_path TEXT,
      file_name TEXT,
      mime_type TEXT,
      size INTEGER,
      updated_at INTEGER NOT NULL
    )`,
    `INSERT OR IGNORE INTO directors_bg_video (id, updated_at) VALUES (1, ${Date.now()})`,
  ]
  for (const sql of stmts) {
    await db.execute(sql)
  }
}

export async function getDb(): Promise<Client> {
  if (!client) {
    client = createDbClient()
  }
  if (!initialized) {
    initialized = initSchema(client).catch((err) => {
      // Reset so next request retries instead of reusing a failed promise
      initialized = null
      throw err
    })
  }
  await initialized
  return client
}
