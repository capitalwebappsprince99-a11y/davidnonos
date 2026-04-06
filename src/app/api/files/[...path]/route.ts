import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'data', 'uploads')
}

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const relative = segments.join('/')
  const absPath = path.join(getUploadsDir(), relative)

  // Prevent path traversal
  const uploadsDir = getUploadsDir()
  const resolved = path.resolve(absPath)
  if (!resolved.startsWith(path.resolve(uploadsDir))) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const buffer = await fs.readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'

    // Stream large files (videos) efficiently
    const rangeHeader = req.headers.get('range')
    if (rangeHeader && contentType.startsWith('video/')) {
      const size = buffer.length
      const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-')
      const start = parseInt(startStr, 10)
      const end = endStr ? parseInt(endStr, 10) : size - 1
      const chunk = buffer.slice(start, end + 1)

      return new NextResponse(chunk, {
        status: 206,
        headers: {
          'Content-Type': contentType,
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunk.length),
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
