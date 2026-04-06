import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { deleteFile } from '@/lib/upload'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()
  const res = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
  if (!res.rows[0]) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })
  return Response.json(res.rows[0])
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()

  const existing = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
  if (!existing.rows[0]) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  const body = await request.json()
  const { alt_text, order_index } = body

  await db.execute({
    sql: `UPDATE moodboard_photos SET
      alt_text    = CASE WHEN ? IS NOT NULL THEN ? ELSE alt_text END,
      order_index = COALESCE(?, order_index)
    WHERE id = ?`,
    args: [alt_text, alt_text?.trim() ?? null, order_index !== undefined ? Number(order_index) : null, id],
  })

  const res = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
  return Response.json(res.rows[0])
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()

  const res = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
  if (!res.rows[0]) return Response.json({ error: 'Photo introuvable.' }, { status: 404 })

  await deleteFile((res.rows[0] as Record<string, unknown>).file_path as string)
  await db.execute({ sql: 'DELETE FROM moodboard_photos WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
