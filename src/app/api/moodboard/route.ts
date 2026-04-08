import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT * FROM moodboard_photos ORDER BY order_index ASC, created_at ASC')
  return Response.json(res.rows)
}

export async function POST(request: NextRequest) {
  try {
    // Accepts JSON array: [{ file_path, file_name, mime_type, size, alt_text? }]
    const body = await request.json()
    const files: Array<{ file_path: string; file_name: string; mime_type: string; size: number; alt_text?: string }> = Array.isArray(body) ? body : [body]

    if (!files.length) return Response.json({ error: 'Au moins une photo est requise.' }, { status: 400 })

    const db = await getDb()
    const maxRes = await db.execute('SELECT MAX(order_index) as m FROM moodboard_photos')
    let nextOrder = ((maxRes.rows[0]?.m as number | null) ?? -1) + 1

    const inserted = []

    for (const f of files) {
      if (!f.file_path) continue
      const id = uuidv4()
      const now = Date.now()

      await db.execute({
        sql: `INSERT INTO moodboard_photos (id, file_path, file_name, mime_type, size, alt_text, order_index, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, f.file_path, f.file_name ?? '', f.mime_type ?? '', f.size ?? 0, f.alt_text?.trim() ?? null, nextOrder, now],
      })

      const res = await db.execute({ sql: 'SELECT * FROM moodboard_photos WHERE id = ?', args: [id] })
      inserted.push(res.rows[0])
      nextOrder++
    }

    return Response.json(inserted, { status: 201 })
  } catch (e: unknown) {
    return Response.json({ error: (e as Error).message }, { status: 500 })
  }
}
