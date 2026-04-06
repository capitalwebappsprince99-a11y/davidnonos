import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { saveUploadedFile, deleteFile } from '@/lib/upload'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT file_path FROM directors_bg_video WHERE id = 1')
  return NextResponse.json({ file_path: (res.rows[0]?.file_path as string | null) ?? null })
}

export async function PUT(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })

    const db = await getDb()
    const existing = await db.execute('SELECT file_path FROM directors_bg_video WHERE id = 1')
    const existingPath = existing.rows[0]?.file_path as string | null
    if (existingPath) await deleteFile(existingPath)

    const uploaded = await saveUploadedFile(file, 'directors-bg')

    await db.execute({
      sql: `UPDATE directors_bg_video SET file_path = ?, file_name = ?, mime_type = ?, size = ?, updated_at = ? WHERE id = 1`,
      args: [uploaded.filePath, uploaded.fileName, uploaded.mimeType, uploaded.size, Date.now()],
    })

    return NextResponse.json({ file_path: uploaded.filePath })
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}

export async function DELETE() {
  const db = await getDb()
  const res = await db.execute('SELECT file_path FROM directors_bg_video WHERE id = 1')
  const existingPath = res.rows[0]?.file_path as string | null
  if (existingPath) await deleteFile(existingPath)
  await db.execute({ sql: 'UPDATE directors_bg_video SET file_path = NULL, file_name = NULL, mime_type = NULL, size = NULL, updated_at = ? WHERE id = 1', args: [Date.now()] })
  return NextResponse.json({ ok: true })
}
