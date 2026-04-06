import { NextRequest } from 'next/server'
import { getDb } from '@/lib/db'

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()
  const collab = db.prepare('SELECT * FROM collaborators WHERE id = ?').get(id)
  if (!collab) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })
  return Response.json(collab)
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM collaborators WHERE id = ?').get(id)
  if (!existing) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })

  const body = await request.json()
  const { name, role, order_index } = body

  db.prepare(`
    UPDATE collaborators SET
      name        = COALESCE(?, name),
      role        = CASE WHEN ? IS NOT NULL THEN ? ELSE role END,
      order_index = COALESCE(?, order_index),
      updated_at  = ?
    WHERE id = ?
  `).run(
    name?.trim() ?? null,
    role,
    role?.trim() ?? null,
    order_index !== undefined ? Number(order_index) : null,
    Date.now(),
    id,
  )

  return Response.json(db.prepare('SELECT * FROM collaborators WHERE id = ?').get(id))
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params
  const db = getDb()

  const existing = db.prepare('SELECT * FROM collaborators WHERE id = ?').get(id)
  if (!existing) return Response.json({ error: 'Collaborateur introuvable.' }, { status: 404 })

  db.prepare('DELETE FROM collaborators WHERE id = ?').run(id)
  return new Response(null, { status: 204 })
}
