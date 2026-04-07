import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const bioRes = await db.execute('SELECT * FROM bio WHERE id = 1')
  const bio = bioRes.rows[0] ?? {}
  const collabRes = await db.execute('SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC')
  return Response.json({ ...bio, collaborators: collabRes.rows })
}

export async function PUT(request: NextRequest) {
  const db = await getDb()
  const body = await request.json()
  const { bio_text, image_path, image_name } = body

  await db.execute({
    sql: `UPDATE bio SET
      bio_text   = CASE WHEN ? IS NOT NULL THEN ? ELSE bio_text END,
      image_path = COALESCE(?, image_path),
      image_name = COALESCE(?, image_name),
      updated_at = ?
    WHERE id = 1`,
    args: [bio_text ?? null, bio_text?.trim() ?? null, image_path ?? null, image_name ?? null, Date.now()],
  })

  const updatedRes = await db.execute('SELECT * FROM bio WHERE id = 1')
  const collabRes = await db.execute('SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC')
  return Response.json({ ...updatedRes.rows[0], collaborators: collabRes.rows })
}
