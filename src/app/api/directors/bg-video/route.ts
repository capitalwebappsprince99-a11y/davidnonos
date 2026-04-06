import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET() {
  const db = getDb()
  const row = db.prepare('SELECT file_path FROM directors_bg_video WHERE id = 1').get() as { file_path: string | null } | undefined
  return NextResponse.json({ file_path: row?.file_path ?? null })
}

export async function PUT(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })

    const db = getDb()
    const existing = db.prepare('SELECT file_path FROM directors_bg_video WHERE id = 1').get() as { file_path: string | null } | undefined
    if (existing?.file_path) await deleteFile(existing.file_path)

    const uploaded = await saveUploadedFile(file, 'directors-bg')

    db.prepare(`
      UPDATE directors_bg_video
      SET file_path = ?, file_name = ?, mime_type = ?, size = ?, updated_at = ?
      WHERE id = 1
    `).run(uploaded.filePath, uploaded.fileName, uploaded.mimeType, uploaded.size, Date.now())

    return NextResponse.json({ file_path: uploaded.filePath })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}

export async function DELETE() {
  const db = getDb()
  const existing = db.prepare('SELECT file_path FROM directors_bg_video WHERE id = 1').get() as { file_path: string | null } | undefined
  if (existing?.file_path) await deleteFile(existing.file_path)
  db.prepare('UPDATE directors_bg_video SET file_path = NULL, file_name = NULL, mime_type = NULL, size = NULL, updated_at = ? WHERE id = 1').run(Date.now())
  return NextResponse.json({ ok: true })
}
