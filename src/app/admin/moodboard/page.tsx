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

interface Photo { id: string; file_path: string; file_name: string; size: number }

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnDanger: { background: 'rgba(224,82,82,0.15)', color: '#e05252', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' },
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 40 } as React.CSSProperties,
}

function formatSize(b: number) { return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB` }

export default function MoodboardPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [files, setFiles] = useState<FileList | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => { const r = await fetch('/api/moodboard'); setPhotos(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault(); if (!files?.length) return
    setUploading(true); setError(null)
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async f => {
          const url = await blobUpload(f, 'photos')
          return { file_path: url, file_name: f.name, mime_type: f.type, size: f.size }
        })
      )
      const r = await fetch('/api/moodboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploaded),
      })
      if (r.ok) { setFiles(null); if (fileRef.current) fileRef.current.value = ''; await load() }
      else { const d = await r.json(); setError(d.error ?? 'Erreur.') }
    } catch (err) { setError((err as Error).message) }
    setUploading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette photo ?')) return
    await fetch(`/api/moodboard/${id}`, { method: 'DELETE' }); await load()
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Galerie</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>Moodboard</h1>

      <form onSubmit={handleUpload} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 22 }}>Ajouter des photos</p>
        <div style={{ marginBottom: 20 }}>
          <label style={F.label}>Fichiers * — jpg, png, webp, gif (max 20 MB · sélection multiple)</label>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple onChange={e => setFiles(e.target.files)} required
            style={{ fontSize: 12, color: '#777', display: 'block' }} />
          {files && files.length > 0 && (
            <p style={{ fontSize: 11, color: '#555', marginTop: 8 }}>{files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}</p>
          )}
        </div>
        {error && <p style={{ color: '#e05252', fontSize: 12, marginBottom: 16 }}>{error}</p>}
        <button type="submit" disabled={uploading || !files?.length}
          style={{ ...F.btn, opacity: (uploading || !files?.length) ? 0.4 : 1 }}>
          {uploading ? 'Upload…' : 'Uploader'}
        </button>
      </form>

      <p style={{ fontSize: 12, color: '#444', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {photos.length} photo{photos.length !== 1 ? 's' : ''}
      </p>

      {loading ? <p style={{ color: '#444', fontSize: 13 }}>Chargement…</p>
        : photos.length === 0 ? <p style={{ color: '#333', fontSize: 13 }}>Aucune photo.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: '#111', aspectRatio: '1/1' }}
                onMouseEnter={e => { (e.currentTarget.querySelector('.del-btn') as HTMLElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget.querySelector('.del-btn') as HTMLElement).style.opacity = '0' }}
              >
                <img src={p.file_path} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div className="del-btn" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 6, opacity: 0, transition: 'opacity 0.2s',
                }}>
                  <p style={{ fontSize: 10, color: '#aaa', textAlign: 'center', padding: '0 8px', letterSpacing: '0.03em' }}>{formatSize(p.size)}</p>
                  <button onClick={() => handleDelete(p.id)} style={F.btnDanger}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
