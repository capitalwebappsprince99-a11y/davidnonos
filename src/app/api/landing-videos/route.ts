import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT * FROM landing_videos ORDER BY order_index ASC, created_at ASC')
  return Response.json(res.rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, subtitle, file_path, file_name, mime_type, size, order_index } = body

  if (!file_path) return Response.json({ error: 'URL fichier requise.' }, { status: 400 })
  if (!title?.trim()) return Response.json({ error: 'Titre requis.' }, { status: 400 })

  const db = await getDb()
  const maxRes = await db.execute('SELECT MAX(order_index) as m FROM landing_videos')
  const maxOrder = (maxRes.rows[0]?.m as number | null) ?? -1
  const now = Date.now()
  const id = uuidv4()

  await db.execute({
    sql: `INSERT INTO landing_videos (id, title, subtitle, file_path, file_name, mime_type, size, order_index, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, title.trim(), subtitle?.trim() ?? null,
      file_path, file_name ?? '', mime_type ?? '', size ?? 0,
      order_index !== undefined ? Number(order_index) : maxOrder + 1,
      now, now,
    ],
  })

  const res = await db.execute({ sql: 'SELECT * FROM landing_videos WHERE id = ?', args: [id] })
  return Response.json(res.rows[0], { status: 201 })
}
