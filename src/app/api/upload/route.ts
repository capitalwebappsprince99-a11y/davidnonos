import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { NextRequest } from 'next/server'

const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
]

function sanitize(filename: string): string {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-zA-Z0-9._-]/g, '_')                 // replace special chars
    .replace(/_+/g, '_')                               // collapse underscores
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { pathname, contentType } = await request.json()
    if (!pathname) return Response.json({ error: 'pathname requis.' }, { status: 400 })

    // Sanitize each path segment
    const parts = pathname.split('/')
    const clean = parts.map((p: string, i: number) =>
      i === parts.length - 1 ? sanitize(p) : p
    ).join('/')

    const token = await generateClientTokenFromReadWriteToken({
      pathname: clean,
      allowedContentTypes: contentType ? [contentType] : ALLOWED_TYPES,
      maximumSizeInBytes: 500 * 1024 * 1024,
    })

    return Response.json({ token, pathname: clean })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
