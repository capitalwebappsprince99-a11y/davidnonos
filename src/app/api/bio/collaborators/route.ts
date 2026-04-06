import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const collaborators = db.prepare(
    'SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC'
  ).all()
  return Response.json(collaborators)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, role, order_index } = body

  if (!name?.trim()) {
    return Response.json({ error: 'Nom du collaborateur requis.' }, { status: 400 })
  }

  const db = getDb()
  const maxOrderRow = db.prepare('SELECT MAX(order_index) as m FROM collaborators').get() as { m: number | null }
  const now = Date.now()
  const id = uuidv4()

  db.prepare(`
    INSERT INTO collaborators (id, name, role, order_index, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name.trim(),
    role?.trim() ?? null,
    order_index !== undefined ? Number(order_index) : (maxOrderRow.m ?? -1) + 1,
    now,
    now,
  )

  return Response.json(db.prepare('SELECT * FROM collaborators WHERE id = ?').get(id), { status: 201 })
}
