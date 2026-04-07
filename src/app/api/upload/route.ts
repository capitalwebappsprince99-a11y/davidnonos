import { put } from '@vercel/blob'
import { NextRequest } from 'next/server'

const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
]

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string | null) ?? 'uploads'

    if (!file) return Response.json({ error: 'Fichier manquant.' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'Type non autorisé.' }, { status: 400 })

    const blob = await put(`${folder}/${file.name}`, file, { access: 'public' })
    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
