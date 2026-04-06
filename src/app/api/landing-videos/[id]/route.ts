import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { deleteFile, saveUploadedFile } from '@/lib/upload'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const video = db.prepare('SELECT * FROM landing_videos WHERE id = ?').get(id)
  if (!video) return Response.json({ error: 'Vidéo introuvable.' }, { status: 404 })
  return Response.json(video)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM landing_videos WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return Response.json({ error: 'Vidéo introuvable.' }, { status: 404 })

  const contentType = request.headers.get('content-type') ?? ''
  let title: string | null = null
  let subtitle: string | null = null
  let orderIndex: number | null = null
  let newFilePath: string | null = null
  let newFileName: string | null = null
  let newMimeType: string | null = null
  let newSize: number | null = null

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    title = formData.get('title') as string | null
    subtitle = formData.get('subtitle') as string | null
    const oi = formData.get('order_index')
    if (oi !== null) orderIndex = Number(oi)

    const file = formData.get('file') as File | null
    if (file) {
      try {
        const uploaded = await saveUploadedFile(file, 'videos')
        await deleteFile(existing.file_path as string)
        newFilePath = uploaded.filePath
        newFileName = uploaded.fileName
        newMimeType = uploaded.mimeType
        newSize = uploaded.size
      } catch (err) {
        return Response.json({ error: (err as Error).message }, { status: 422 })
      }
    }
  } else {
    const body = await request.json()
    title = body.title ?? null
    subtitle = body.subtitle ?? null
    orderIndex = body.order_index ?? null
  }

  const now = Date.now()
  db.prepare(`
    UPDATE landing_videos SET
      title       = COALESCE(?, title),
      subtitle    = CASE WHEN ? IS NOT NULL THEN ? ELSE subtitle END,
      file_path   = COALESCE(?, file_path),
      file_name   = COALESCE(?, file_name),
      mime_type   = COALESCE(?, mime_type),
      size        = COALESCE(?, size),
      order_index = COALESCE(?, order_index),
      updated_at  = ?
    WHERE id = ?
  `).run(
    title?.trim() ?? null,
    subtitle,
    subtitle?.trim() ?? null,
    newFilePath,
    newFileName,
    newMimeType,
    newSize,
    orderIndex,
    now,
    id,
  )

  return Response.json(db.prepare('SELECT * FROM landing_videos WHERE id = ?').get(id))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM landing_videos WHERE id = ?').get(id) as Record<string, unknown> | undefined
  if (!existing) return Response.json({ error: 'Vidéo introuvable.' }, { status: 404 })

  await deleteFile(existing.file_path as string)
  db.prepare('DELETE FROM landing_videos WHERE id = ?').run(id)

  return new Response(null, { status: 204 })
}
