import { put } from '@vercel/blob'

function sanitize(filename: string): string {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}

export async function POST(request: Request): Promise<Response> {
  try {
    const filename = decodeURIComponent(request.headers.get('x-filename') ?? 'upload')
    const folder = request.headers.get('x-folder') ?? 'uploads'
    const contentType = request.headers.get('content-type') ?? 'application/octet-stream'
    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) return Response.json({ error: 'BLOB_READ_WRITE_TOKEN manquant.' }, { status: 500 })
    if (!request.body) return Response.json({ error: 'Corps de requête manquant.' }, { status: 400 })

    const pathname = `${folder}/${sanitize(filename)}`
    const blob = await put(pathname, request.body, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
      cacheControlMaxAge: 31536000,
      token,
    })

    return Response.json({ url: blob.url })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
