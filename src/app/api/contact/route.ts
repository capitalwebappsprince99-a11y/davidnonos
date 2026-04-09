import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = await getDb()
  const [info, contacts] = await Promise.all([
    db.execute('SELECT * FROM contact_info WHERE id = 1'),
    db.execute('SELECT * FROM contacts ORDER BY section, order_index'),
  ])
  return NextResponse.json({
    info: info.rows[0] ?? { address: '' },
    contacts: contacts.rows,
  })
}

export async function PUT(req: Request) {
  const { address } = await req.json()
  const db = await getDb()
  await db.execute({
    sql: 'UPDATE contact_info SET address = ?, updated_at = ? WHERE id = 1',
    args: [address ?? '', Date.now()],
  })
  return NextResponse.json({ ok: true })
}
