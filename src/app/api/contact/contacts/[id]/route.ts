import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { section, name, title, email, phone, order_index } = await req.json()
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE contacts SET section=?, name=?, title=?, email=?, phone=?, order_index=?, updated_at=? WHERE id=?',
    args: [section, name ?? null, title ?? null, email ?? null, phone ?? null, order_index ?? 0, Date.now(), id],
  })
  const row = await db.execute({ sql: 'SELECT * FROM contacts WHERE id = ?', args: [id] })
  return NextResponse.json(row.rows[0])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = await getDb()
  await db.execute({ sql: 'DELETE FROM contacts WHERE id = ?', args: [id] })
  return NextResponse.json({ ok: true })
}
