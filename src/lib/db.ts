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
  await db.batch([
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
    `CREATE TABLE IF NOT EXISTS contact_info (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      address TEXT,
      updated_at INTEGER NOT NULL
    )`,
    `INSERT OR IGNORE INTO contact_info (id, address, updated_at) VALUES (1, '28 RUE CHATEAUDUN 75009 PARIS', ${Date.now()})`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      section TEXT NOT NULL,
      name TEXT,
      title TEXT,
      email TEXT,
      phone TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-1','executives','Jean Duhamel',NULL,'jeanduhamel@iconoclast.tv',NULL,0,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-2','executives','Camille Lambert',NULL,'clambert@iconoclast.tv',NULL,1,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-3','executives','Domitille Laurens',NULL,'domitille@iconoclast.tv',NULL,2,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-4','executives','Nathalie Lecaer',NULL,'nathalie@iconoclast.tv',NULL,3,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-5','executives','China Presles',NULL,'china@iconoclast.tv',NULL,4,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-exec-6','executives','Benoit Roques',NULL,'benoit@iconoclast.tv',NULL,5,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-mv-1','music-videos',NULL,'Musique Vidéo','musicvideo@iconoclast.tv',NULL,0,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-ft-1','films-tv',NULL,'Films','film@iconoclast.tv',NULL,0,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-ft-2','films-tv',NULL,'Séries TV','tvseries@iconoclast.tv',NULL,1,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-mu-1','music','Leo Copet','Head of Music / Publishing','leo@iconoclast.tv',NULL,0,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-0','image',NULL,'Image','hello@iconoclastimage.tv',NULL,0,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-1','image','Felix Mondino','Head of Print',NULL,NULL,1,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-2','image','Roxane Puig','Agent',NULL,NULL,2,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-3','image','Ravo Adiba','Head of Production',NULL,NULL,3,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-4','image','Iliana Largillier','Producer',NULL,NULL,4,${Date.now()},${Date.now()})`,
    `INSERT OR IGNORE INTO contacts VALUES ('c-img-5','image','Alicia Jiang','Production Manager',NULL,NULL,5,${Date.now()},${Date.now()})`,
  ], 'write')
}

export async function getDb(): Promise<Client> {
  if (!client) {
    client = createDbClient()
  }
  if (!initialized) {
    initialized = initSchema(client)
  }
  await initialized
  return client
}
