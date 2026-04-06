import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT * FROM landing_videos ORDER BY order_index ASC, created_at ASC')
  return Response.json(res.rows)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = formData.get('title') as string | null
  const subtitle = formData.get('subtitle') as string | null
  const orderIndex = formData.get('order_index')

  if (!file) return Response.json({ error: 'Fichier vidéo requis.' }, { status: 400 })
  if (!title?.trim()) return Response.json({ error: 'Titre requis.' }, { status: 400 })

  let uploaded
  try {
    uploaded = await saveUploadedFile(file, 'videos')
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 422 })
  }

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
      uploaded.filePath, uploaded.fileName, uploaded.mimeType, uploaded.size,
      orderIndex !== null ? Number(orderIndex) : maxOrder + 1,
      now, now,
    ],
  })

  const res = await db.execute({ sql: 'SELECT * FROM landing_videos WHERE id = ?', args: [id] })
  return Response.json(res.rows[0], { status: 201 })
}
