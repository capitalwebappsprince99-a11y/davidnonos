import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }> }

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{11}/

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:v=|embed\/|shorts\/|youtu\.be\/)([\w-]{11})/)
  return match ? match[1] : null
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const clip = db.prepare('SELECT * FROM clips WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!clip) return Response.json({ error: 'Clip introuvable.' }, { status: 404 })
  return Response.json({ ...clip, youtube_id: extractYoutubeId(clip.youtube_url as string) })
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM clips WHERE id = ?').get(id)
  if (!existing) return Response.json({ error: 'Clip introuvable.' }, { status: 404 })

  const body = await request.json()
  const { youtube_url, title, order_index } = body

  if (youtube_url !== undefined && !YOUTUBE_REGEX.test(youtube_url.trim())) {
    return Response.json({ error: 'URL YouTube invalide.' }, { status: 422 })
  }

  db.prepare(`
    UPDATE clips SET
      youtube_url = COALESCE(?, youtube_url),
      title       = CASE WHEN ? IS NOT NULL THEN ? ELSE title END,
      order_index = COALESCE(?, order_index),
      updated_at  = ?
    WHERE id = ?
  `).run(
    youtube_url?.trim() ?? null,
    title,
    title?.trim() ?? null,
    order_index !== undefined ? Number(order_index) : null,
    Date.now(),
    id,
  )

  const updated = db.prepare('SELECT * FROM clips WHERE id = ?').get(id) as Record<string, unknown>
  return Response.json({ ...updated, youtube_id: extractYoutubeId(updated.youtube_url as string) })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM clips WHERE id = ?').get(id)
  if (!existing) return Response.json({ error: 'Clip introuvable.' }, { status: 404 })

  db.prepare('DELETE FROM clips WHERE id = ?').run(id)
  return new Response(null, { status: 204 })
}
