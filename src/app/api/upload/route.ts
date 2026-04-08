import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json() as HandleUploadBody
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
          'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
        ],
        addRandomSuffix: true,
        cacheControlMaxAge: 31536000,
      }),
    })
    return Response.json(jsonResponse)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
}
