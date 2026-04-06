import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|embed\/|shorts\/|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

export async function GET() {
  const db = getDb()
  const clips = db.prepare(
    'SELECT * FROM clips ORDER BY order_index ASC, created_at ASC'
  ).all()
  return Response.json(clips)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { youtube_url, title, order_index } = body

  if (!youtube_url?.trim()) {
    return Response.json({ error: 'URL YouTube requise.' }, { status: 400 })
  }
  if (!YOUTUBE_REGEX.test(youtube_url.trim())) {
    return Response.json({ error: 'URL YouTube invalide.' }, { status: 422 })
  }

  const db = getDb()
  const now = Date.now()
  const id = uuidv4()

  const maxOrder = (db.prepare('SELECT MAX(order_index) as m FROM clips').get() as { m: number | null }).m ?? -1

  db.prepare(`
    INSERT INTO clips (id, youtube_url, title, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    youtube_url.trim(),
    title?.trim() ?? null,
    order_index !== undefined ? Number(order_index) : maxOrder + 1,
    now,
    now,
  )

  const clip = db.prepare('SELECT * FROM clips WHERE id = ?').get(id) as Record<string, unknown>
  return Response.json({ ...clip, youtube_id: extractYoutubeId(youtube_url) }, { status: 201 })
}
