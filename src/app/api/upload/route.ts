import { handleUpload, type HandleUploadBody } from '@vercel/blob'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
          'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
        ],
        maximumSizeInBytes: 500 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    })
    return Response.json(json)
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
