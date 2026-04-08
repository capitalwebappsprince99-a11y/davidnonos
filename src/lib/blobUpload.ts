function sanitize(name: string) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}

export async function blobUpload(file: File, folder: string): Promise<string> {
  const pathname = `${folder}/${sanitize(file.name)}`

  // Step 1: ask the server for a client token (tiny JSON request, no file involved)
  const tokenRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'blob.generate-client-token',
      payload: { pathname, clientPayload: null, multipart: false },
    }),
  })
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok || !tokenData.clientToken) {
    throw new Error(tokenData.error ?? `Token error ${tokenRes.status}`)
  }

  // Step 2: upload the file directly from the browser to Vercel Blob
  const uploadRes = await fetch(
    `https://vercel.com/api/blob/?${new URLSearchParams({ pathname })}`,
    {
      method: 'PUT',
      headers: {
        'authorization': `Bearer ${tokenData.clientToken}`,
        'x-api-version': '12',
        'x-content-type': file.type || 'application/octet-stream',
        'x-vercel-blob-access': 'public',
      },
      body: file,
    }
  )

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => String(uploadRes.status))
    throw new Error(`Blob upload failed (${uploadRes.status}): ${text}`)
  }

  const result = await uploadRes.json()
  if (!result.url) throw new Error('No URL in blob response')
  return result.url
}
