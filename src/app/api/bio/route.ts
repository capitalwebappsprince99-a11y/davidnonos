import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'
import { deleteFile, saveUploadedFile } from '@/lib/upload'

export async function GET() {
  const db = getDb()
  const bio = db.prepare('SELECT * FROM bio WHERE id = 1').get() as Record<string, unknown>
  const collaborators = db.prepare(
    'SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC'
  ).all()
  return Response.json({ ...bio, collaborators })
}

export async function PUT(request: NextRequest) {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM bio WHERE id = 1').get() as Record<string, unknown>

  const contentType = request.headers.get('content-type') ?? ''
  let bioText: string | null = null
  let newImagePath: string | null = null
  let newImageName: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    bioText = formData.get('bio_text') as string | null

    const image = formData.get('image') as File | null
    if (image) {
      try {
        const uploaded = await saveUploadedFile(image, 'bio')
        if (existing.image_path) await deleteFile(existing.image_path as string)
        newImagePath = uploaded.filePath
        newImageName = uploaded.fileName
      } catch (err) {
        return Response.json({ error: (err as Error).message }, { status: 422 })
      }
    }
  } else {
    const body = await request.json()
    bioText = body.bio_text ?? null
  }

  db.prepare(`
    UPDATE bio SET
      bio_text   = CASE WHEN ? IS NOT NULL THEN ? ELSE bio_text END,
      image_path = COALESCE(?, image_path),
      image_name = COALESCE(?, image_name),
      updated_at = ?
    WHERE id = 1
  `).run(bioText, bioText?.trim() ?? null, newImagePath, newImageName, Date.now())

  const updated = db.prepare('SELECT * FROM bio WHERE id = 1').get() as Record<string, unknown>
  const collaborators = db.prepare(
    'SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC'
  ).all()
  return Response.json({ ...updated, collaborators })
}
