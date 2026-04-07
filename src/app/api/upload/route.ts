import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client'
import { NextRequest } from 'next/server'

const ALLOWED_TYPES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
]

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { pathname, contentType } = await request.json()
    if (!pathname) return Response.json({ error: 'pathname requis.' }, { status: 400 })

    const token = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: contentType ? [contentType] : ALLOWED_TYPES,
      maximumSizeInBytes: 500 * 1024 * 1024,
      addRandomSuffix: true,
    })

    return Response.json({ token })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
