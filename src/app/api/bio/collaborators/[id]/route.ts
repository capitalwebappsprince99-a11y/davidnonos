import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()
  const res = await db.execute({ sql: 'SELECT * FROM collaborators WHERE id = ?', args: [id] })
  if (!res.rows[0]) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })
  return Response.json(res.rows[0])
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()

  const existing = await db.execute({ sql: 'SELECT * FROM collaborators WHERE id = ?', args: [id] })
  if (!existing.rows[0]) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })

  const body = await request.json()
  const { name, role, order_index } = body

  await db.execute({
    sql: `UPDATE collaborators SET
      name        = COALESCE(?, name),
      role        = CASE WHEN ? IS NOT NULL THEN ? ELSE role END,
      order_index = COALESCE(?, order_index),
      updated_at  = ?
    WHERE id = ?`,
    args: [
      name?.trim() ?? null,
      role,
      role?.trim() ?? null,
      order_index !== undefined ? Number(order_index) : null,
      Date.now(),
      id,
    ],
  })

  const res = await db.execute({ sql: 'SELECT * FROM collaborators WHERE id = ?', args: [id] })
  return Response.json(res.rows[0])
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = await getDb()

  const existing = await db.execute({ sql: 'SELECT * FROM collaborators WHERE id = ?', args: [id] })
  if (!existing.rows[0]) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })

  await db.execute({ sql: 'DELETE FROM collaborators WHERE id = ?', args: [id] })
  return new Response(null, { status: 204 })
}
