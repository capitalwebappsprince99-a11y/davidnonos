import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'
import { saveUploadedFile } from '@/lib/upload'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT * FROM moodboard_photos ORDER BY order_index ASC, created_at ASC')
  return Response.json(res.rows)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]
  const altText = formData.get('alt_text') as string | null

  if (!files.length) return Response.json({ error: 'Au moins une photo est requise.' }, { status: 400 })

  const db = await getDb()
  const maxRes = await db.execute('SELECT MAX(order_index) as m FROM moodboard_photos')
  let nextOrder = ((maxRes.rows[0]?.m as number | null) ?? -1) + 1

  const inserted = []

  for (const file of files) {
    let uploaded
    try {
      uploaded = await saveUploadedFile(file, 'photos')
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 422 })
    }

    const id = uuidv4()
    const now = Date.now()

    await db.execute({
      sql: `INSERT INTO moodboard_photos (id, file_path, file_name, mime_type, size, alt_text, order_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, uploaded.filePath, uploaded.fileName, uploaded.mimeType, uploaded.size, altText?.trim() ?? null, nextOrder, now],
    })

    const res = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
    inserted.push(res.rows[0])
    nextOrder++
  }

  return Response.json(inserted, { status: 201 })
}
