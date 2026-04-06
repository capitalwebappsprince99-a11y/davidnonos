import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  const db = getDb()
  const videos = db.prepare(
    'SELECT * FROM landing_videos ORDER BY order_index ASC, created_at ASC'
  ).all()
  return Response.json(videos)
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

  const now = Date.now()
  const id = uuidv4()
  const db = getDb()

  const maxOrder = (db.prepare('SELECT MAX(order_index) as m FROM landing_videos').get() as { m: number | null }).m ?? -1

  db.prepare(`
    INSERT INTO landing_videos (id, title, subtitle, file_path, file_name, mime_type, size, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    subtitle?.trim() ?? null,
    uploaded.filePath,
    uploaded.fileName,
    uploaded.mimeType,
    uploaded.size,
    orderIndex !== null ? Number(orderIndex) : maxOrder + 1,
    now,
    now,
  )

  const video = db.prepare('SELECT * FROM landing_videos WHERE id = ?').get(id)
  return Response.json(video, { status: 201 })
}
