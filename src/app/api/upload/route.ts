export const runtime = 'edge'

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

    const pathname = `${folder}/${sanitize(filename)}`
    const blobRes = await fetch(
      `https://blob.vercel-storage.com/${pathname}?addRandomSuffix=1`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': contentType,
          'x-cache-control-max-age': '31536000',
        },
        body: request.body,
        // @ts-expect-error duplex needed for streaming
        duplex: 'half',
      }
    )

    if (!blobRes.ok) {
      const err = await blobRes.text()
      return Response.json({ error: err }, { status: blobRes.status })
    }

    const result = await blobRes.json() as { url: string }
    return Response.json({ url: result.url })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 })
  }
}
