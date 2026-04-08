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

interface Video {
  id: string; title: string; subtitle: string | null
  file_path: string; file_name: string; size: number
}

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  input: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' },
  btnGhost: { background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'transparent', color: '#e05252', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  card: { border: '1px solid #1e1e1e', borderRadius: 12, padding: '18px 20px', marginBottom: 10 },
  row: { display: 'flex', gap: 16 } as React.CSSProperties,
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 40 } as React.CSSProperties,
}

function formatSize(b: number) {
  return b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function LandingVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState(''); const [subtitle, setSubtitle] = useState(''); const [file, setFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState(''); const [editSubtitle, setEditSubtitle] = useState('')

  const load = async () => { const r = await fetch('/api/landing-videos'); setVideos(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault(); if (!file || !title.trim()) return
    setUploading(true); setError(null); setUploadProgress('Upload vers le CDN…')
    try {
      const blobUrl = await blobUpload(file, 'videos')
      setUploadProgress('Sauvegarde…')
      const r = await fetch('/api/landing-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), subtitle: subtitle.trim() || null, file_path: blobUrl, file_name: file.name, mime_type: file.type, size: file.size }),
      })
      if (r.ok) { setTitle(''); setSubtitle(''); setFile(null); if (fileRef.current) fileRef.current.value = ''; await load() }
      else { const d = await r.json(); setError(d.error ?? 'Erreur.') }
    } catch (err) { setError((err as Error).message) }
    setUploading(false); setUploadProgress('')
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette vidéo ?')) return
    await fetch(`/api/landing-videos/${id}`, { method: 'DELETE' }); await load()
  }

  async function handleEdit(id: string) {
    await fetch(`/api/landing-videos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editTitle, subtitle: editSubtitle }) })
    setEditId(null); await load()
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Landing</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>Vidéos</h1>

      {/* Upload */}
      <form onSubmit={handleUpload} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 22 }}>Ajouter une vidéo</p>
        <div style={{ ...F.row, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={F.label}>Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required style={F.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={F.label}>Sous-titre</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} style={F.input} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={F.label}>Fichier vidéo * — mp4, webm, mov (max 500 MB)</label>
          <input ref={fileRef} type="file" accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={e => setFile(e.target.files?.[0] ?? null)} required
            style={{ fontSize: 12, color: '#777', display: 'block' }} />
        </div>
        {error && <p style={{ color: '#e05252', fontSize: 12, marginBottom: 16 }}>{error}</p>}
        {uploading && uploadProgress && <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>{uploadProgress}</p>}
        <button type="submit" disabled={uploading || !file || !title.trim()} style={{ ...F.btn, opacity: (uploading || !file || !title.trim()) ? 0.4 : 1 }}>
          {uploading ? 'Upload en cours…' : 'Uploader'}
        </button>
      </form>

      {/* List */}
      <p style={{ fontSize: 12, color: '#444', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {videos.length} vidéo{videos.length !== 1 ? 's' : ''}
      </p>
      {loading ? <p style={{ color: '#444', fontSize: 13 }}>Chargement…</p>
        : videos.length === 0 ? <p style={{ color: '#333', fontSize: 13 }}>Aucune vidéo.</p>
        : videos.map(v => (
          <div key={v.id} style={F.card}>
            {editId === v.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={F.input} placeholder="Titre" />
                <input value={editSubtitle} onChange={e => setEditSubtitle(e.target.value)} style={F.input} placeholder="Sous-titre" />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => handleEdit(v.id)} style={F.btn}>Enregistrer</button>
                  <button onClick={() => setEditId(null)} style={F.btnGhost}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 3 }}>{v.title}</p>
                  {v.subtitle && <p style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{v.subtitle}</p>}
                  <p style={{ fontSize: 11, color: '#383838' }}>{v.file_name} · {formatSize(v.size)}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setEditId(v.id); setEditTitle(v.title); setEditSubtitle(v.subtitle ?? '') }} style={F.btnGhost}>Modifier</button>
                  <button onClick={() => handleDelete(v.id)} style={F.btnDanger}>Supprimer</button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
