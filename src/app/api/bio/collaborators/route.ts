import { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const res = await db.execute('SELECT * FROM collaborators ORDER BY order_index ASC, created_at ASC')
  return Response.json(res.rows)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, role, order_index } = body

  if (!name?.trim()) {
    return Response.json({ error: 'Nom du collaborateur requis.' }, { status: 400 })
  }

  const db = await getDb()
  const maxRes = await db.execute('SELECT MAX(order_index) as m FROM collaborators')
  const maxOrder = (maxRes.rows[0]?.m as number | null) ?? -1
  const now = Date.now()
  const id = uuidv4()

  await db.execute({
    sql: `INSERT INTO collaborators (id, name, role, order_index, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      name.trim(),
      role?.trim() ?? null,
      order_index !== undefined ? Number(order_index) : maxOrder + 1,
      now,
      now,
    ],
  })

  const res = await db.execute({ sql: 'SELECT * FROM collaborators WHERE id = ?', args: [id] })
  return Response.json(res.rows[0], { status: 201 })
}
