import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { deleteFile } from '@/lib/upload'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const photo = db.prepare('SELECT * FROM moodboard_photos WHERE id = ?').get(id)
  if (!photo) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })
  return Response.json(photo)
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM moodboard_photos WHERE id = ?').get(id)
  if (!existing) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  const body = await request.json()
  const { alt_text, order_index } = body

  db.prepare(`
    UPDATE moodboard_photos SET
      alt_text    = CASE WHEN ? IS NOT NULL THEN ? ELSE alt_text END,
      order_index = COALESCE(?, order_index)
    WHERE id = ?
  `).run(alt_text, alt_text?.trim() ?? null, order_index !== undefined ? Number(order_index) : null, id)

  return Response.json(db.prepare('SELECT * FROM moodboard_photos WHERE id = ?').get(id))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM moodboard_photos WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  await deleteFile(existing.file_path as string)
  db.prepare('DELETE FROM moodboard_photos WHERE id = ?').run(id)

  return new Response(null, { status: 204 })
}
