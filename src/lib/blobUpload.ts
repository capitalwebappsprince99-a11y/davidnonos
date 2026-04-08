function sanitize(name: string) {
  return name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
}

export async function blobUpload(file: File, folder: string): Promise<string> {
  const pathname = `${folder}/${sanitize(file.name)}`

  // Step 1: get a client token from our server
  let tokenRes: Response
  try {
    tokenRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'blob.generate-client-token',
        payload: { pathname, clientPayload: null, multipart: false },
      }),
    })
  } catch (err) {
    throw new Error(`[étape 1 fetch] ${(err as Error).message}`)
  }

  let tokenData: { clientToken?: string; error?: string; type?: string }
  try {
    tokenData = await tokenRes.json()
  } catch {
    const raw = await tokenRes.text().catch(() => '(illisible)')
    throw new Error(`[étape 1 JSON ${tokenRes.status}] ${raw.slice(0, 300)}`)
  }

  if (!tokenData.clientToken) {
    throw new Error(`[étape 1 pas de token] ${JSON.stringify(tokenData)}`)
  }

  // Step 2: upload directly from browser to Vercel Blob
  let uploadRes: Response
  try {
    uploadRes = await fetch(
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
  } catch (err) {
    throw new Error(`[étape 2 fetch] ${(err as Error).message}`)
  }

  if (!uploadRes.ok) {
    const text = await uploadRes.text().catch(() => String(uploadRes.status))
    throw new Error(`[étape 2 ${uploadRes.status}] ${text.slice(0, 300)}`)
  }

  let result: { url?: string }
  try {
    result = await uploadRes.json()
  } catch (err) {
    throw new Error(`[étape 2 JSON] ${(err as Error).message}`)
  }

  if (!result.url) throw new Error('[étape 2] pas d\'URL dans la réponse')
  return result.url
}
