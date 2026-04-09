import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function GET() {
  const db = await getDb()
  const result = await db.execute('SELECT * FROM contacts ORDER BY section, order_index')
  return NextResponse.json(result.rows)
}

export async function POST(req: Request) {
  const { section, name, title, email, phone, order_index } = await req.json()
  if (!section) return NextResponse.json({ error: 'section requis' }, { status: 400 })
  const db = await getDb()
  const id = randomUUID()
  const now = Date.now()
  await db.execute({
    sql: 'INSERT INTO contacts (id, section, name, title, email, phone, order_index, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [id, section, name ?? null, title ?? null, email ?? null, phone ?? null, order_index ?? 0, now, now],
  })
  const row = await db.execute({ sql: 'SELECT * FROM contacts WHERE id = ?', args: [id] })
  return NextResponse.json(row.rows[0], { status: 201 })
}
