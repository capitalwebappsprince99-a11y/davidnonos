'use client'

import { useEffect, useRef, useState } from 'react'
import { upload } from '@vercel/blob/client'

function sanitize(name: string) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_')
}
async function blobUpload(file: File, folder: string): Promise<string> {
  const blob = await upload(`${folder}/${sanitize(file.name)}`, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
  })
  return blob.url
}

interface BgVideo {
  file_path: string | null
}

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' },
  btnDanger: { background: 'transparent', color: '#e05252', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 32 } as React.CSSProperties,
}

function formatSize(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function DirectorsBgVideoPage() {
  const [current, setCurrent] = useState<BgVideo | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const r = await fetch('/api/directors/bg-video')
    setCurrent(await r.json())
  }
  useEffect(() => { load() }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true); setError(null)
    try {
      const blobUrl = await blobUpload(file, 'directors-bg')
      const r = await fetch('/api/directors/bg-video', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: blobUrl, file_name: file.name, mime_type: file.type, size: file.size }),
      })
      if (r.ok) { setFile(null); if (fileRef.current) fileRef.current.value = ''; await load() }
      else { const d = await r.json(); setError(d.error ?? 'Erreur.') }
    } catch (err) { setError((err as Error).message) }
    setUploading(false)
  }

  async function handleDelete() {
    if (!confirm('Supprimer la vidéo de fond ?')) return
    await fetch('/api/directors/bg-video', { method: 'DELETE' })
    await load()
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Directors</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>Vidéo de fond</h1>

      {/* Current video */}
      {current?.file_path && (
        <div style={F.section}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 16 }}>Vidéo actuelle</p>
          <video
            src={current.file_path}
            controls
            muted
            style={{ width: '100%', borderRadius: 8, marginBottom: 16, maxHeight: 300, objectFit: 'cover', background: '#000' }}
          />
          <button onClick={handleDelete} style={F.btnDanger}>Supprimer</button>
        </div>
      )}

      {/* Upload */}
      <form onSubmit={handleUpload} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 20 }}>
          {current?.file_path ? 'Remplacer la vidéo' : 'Ajouter une vidéo'}
        </p>
        <div style={{ marginBottom: 20 }}>
          <label style={F.label}>Fichier vidéo — mp4, webm, mov (max 500 MB)</label>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            required
            style={{ fontSize: 12, color: '#777', display: 'block' }}
          />
          {file && (
            <p style={{ fontSize: 11, color: '#555', marginTop: 8 }}>
              {file.name} · {formatSize(file.size)}
            </p>
          )}
        </div>
        {error && <p style={{ color: '#e05252', fontSize: 12, marginBottom: 16 }}>{error}</p>}
        <button
          type="submit"
          disabled={uploading || !file}
          style={{ ...F.btn, opacity: (uploading || !file) ? 0.4 : 1 }}
        >
          {uploading ? 'Upload…' : 'Uploader'}
        </button>
      </form>

      <p style={{ fontSize: 12, color: '#333', lineHeight: 1.7 }}>
        La vidéo sera jouée en fond sur la page Directors avec un filtre gris semi-transparent pour que les noms restent lisibles.
      </p>
    </div>
  )
}
