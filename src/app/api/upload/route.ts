export const runtime = 'edge'

import { put } from '@vercel/blob'

const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
]

function sanitize(filename: string): string {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}

export async function POST(request: Request): Promise<Response> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    if (!file) return Response.json({ error: 'Fichier manquant.' }, { status: 400 })
    if (!ALLOWED_TYPES.includes(file.type)) return Response.json({ error: 'Type non autorisé.' }, { status: 400 })

    const fileName = sanitize(file.name)
    const blob = await put(`${folder}/${fileName}`, file, {
      access: 'public',
      multipart: true,
    })

    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
