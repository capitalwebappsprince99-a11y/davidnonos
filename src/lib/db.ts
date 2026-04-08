// Direct Turso HTTP client — bypasses @libsql/client hrana layer
// which has proven unreliable in Vercel serverless environments.

type TursoValue = string | number | null

interface TursoArg {
  type: 'text' | 'integer' | 'float' | 'blob' | 'null'
  value?: string
}

interface TursoCol { name: string }
interface TursoRow { type: string; value?: string }[]

type RawRow = TursoRow[]

interface TursoResult {
  cols: TursoCol[]
  rows: RawRow[]
  affected_row_count: number
  last_insert_rowid: string | null
}

interface PipelineResult {
  type: 'ok' | 'error'
  response?: { type: string; result?: TursoResult }
  error?: { message: string }
}

interface PipelineResponse {
  baton: string | null
  results: PipelineResult[]
}

export interface ResultSet {
  rows: Record<string, TursoValue>[]
  rowsAffected: number
  lastInsertRowid: string | null
}

export interface InStatement {
  sql: string
  args?: TursoValue[]
}

function toArg(v: TursoValue): TursoArg {
  if (v === null) return { type: 'null' }
  if (typeof v === 'number') {
    return Number.isInteger(v)
      ? { type: 'integer', value: String(v) }
      : { type: 'float', value: String(v) }
  }
  return { type: 'text', value: String(v) }
}

function parseResult(result: TursoResult): ResultSet {
  const cols = result.cols.map(c => c.name)
  const rows = result.rows.map((row) => {
    const obj: Record<string, TursoValue> = {}
    row.forEach((cell: { type: string; value?: string }, i: number) => {
      const name = cols[i]
      if (cell.type === 'null' || cell.value === undefined) {
        obj[name] = null
      } else if (cell.type === 'integer') {
        obj[name] = parseInt(cell.value, 10)
      } else if (cell.type === 'float') {
        obj[name] = parseFloat(cell.value)
      } else {
        obj[name] = cell.value
      }
    })
    return obj
  })
  return { rows, rowsAffected: result.affected_row_count, lastInsertRowid: result.last_insert_rowid ?? null }
}

export class TursoClient {
  #url: string
  #token: string

  constructor(url: string, token: string) {
    // Normalize libsql:// → https://
    this.#url = url.replace(/^libsql:\/\//, 'https://')
    this.#token = token
  }

  async execute(stmt: string | InStatement): Promise<ResultSet> {
    const sql = typeof stmt === 'string' ? stmt : stmt.sql
    const args = typeof stmt === 'string' ? [] : (stmt.args ?? [])

    const body = {
      baton: null,
      requests: [
        { type: 'execute', stmt: { sql, args: args.map(toArg) } },
        { type: 'close' },
      ],
    }

    const res = await fetch(`${this.#url}/v3/pipeline`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${this.#token}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Turso HTTP ${res.status}: ${text.slice(0, 200)}`)
    }

    const data: PipelineResponse = await res.json()
    const r = data.results[0]
    if (!r || r.type === 'error') {
      throw new Error(`Turso error: ${r?.error?.message ?? 'unknown'}`)
    }
    const result = r.response?.result
    if (!result) throw new Error('Turso: no result in response')
    return parseResult(result)
  }
}

let db: TursoClient | null = null
let initialized: Promise<void> | null = null

function getClient(): TursoClient {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL
    const token = process.env.TURSO_AUTH_TOKEN ?? ''
    if (!url) throw new Error('TURSO_DATABASE_URL is not set')
    db = new TursoClient(url, token)
  }
  return db
}

async function initSchema(client: TursoClient): Promise<void> {
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
    await client.execute(sql)
  }
}

export async function getDb(): Promise<TursoClient> {
  const client = getClient()
  if (!initialized) {
    initialized = initSchema(client).catch((err) => {
      initialized = null
      throw err
    })
  }
  await initialized
  return client
}
