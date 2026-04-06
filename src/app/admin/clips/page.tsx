'use client'

import { useEffect, useState } from 'react'

interface Clip { id: string; youtube_url: string; youtube_id: string | null; title: string | null }

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  input: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em' },
  btnGhost: { background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'transparent', color: '#e05252', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  card: { border: '1px solid #1e1e1e', borderRadius: 12, padding: '16px 20px', marginBottom: 10 } as React.CSSProperties,
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 40 } as React.CSSProperties,
}

export default function ClipsPage() {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [url, setUrl] = useState(''); const [title, setTitle] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editUrl, setEditUrl] = useState(''); const [editTitle, setEditTitle] = useState('')

  const load = async () => { const r = await fetch('/api/clips'); setClips(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null)
    const r = await fetch('/api/clips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ youtube_url: url, title }) })
    if (r.ok) { setUrl(''); setTitle(''); await load() } else { const d = await r.json(); setError(d.error ?? 'Erreur.') }
    setSaving(false)
  }

  async function handleEdit(id: string) {
    await fetch(`/api/clips/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ youtube_url: editUrl, title: editTitle }) })
    setEditId(null); await load()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce clip ?')) return
    await fetch(`/api/clips/${id}`, { method: 'DELETE' }); await load()
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Clips</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>YouTube</h1>

      <form onSubmit={handleAdd} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 22 }}>Ajouter un clip</p>
        <div style={{ marginBottom: 16 }}>
          <label style={F.label}>URL YouTube *</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} required
            placeholder="https://www.youtube.com/watch?v=…" style={F.input} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={F.label}>Titre (optionnel)</label>
          <input value={title} onChange={e => setTitle(e.target.value)} style={F.input} />
        </div>
        {error && <p style={{ color: '#e05252', fontSize: 12, marginBottom: 16 }}>{error}</p>}
        <button type="submit" disabled={saving || !url.trim()}
          style={{ ...F.btn, opacity: (saving || !url.trim()) ? 0.4 : 1 }}>
          {saving ? 'Ajout…' : 'Ajouter'}
        </button>
      </form>

      <p style={{ fontSize: 12, color: '#444', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {clips.length} clip{clips.length !== 1 ? 's' : ''}
      </p>
      {loading ? <p style={{ color: '#444', fontSize: 13 }}>Chargement…</p>
        : clips.length === 0 ? <p style={{ color: '#333', fontSize: 13 }}>Aucun clip.</p>
        : clips.map(c => (
          <div key={c.id} style={F.card}>
            {editId === c.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={editUrl} onChange={e => setEditUrl(e.target.value)} style={F.input} placeholder="URL YouTube" />
                <input value={editTitle} onChange={e => setEditTitle(e.target.value)} style={F.input} placeholder="Titre" />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => handleEdit(c.id)} style={F.btn}>Enregistrer</button>
                  <button onClick={() => setEditId(null)} style={F.btnGhost}>Annuler</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {c.youtube_id && (
                  <img src={`https://img.youtube.com/vi/${c.youtube_id}/mqdefault.jpg`} alt=""
                    style={{ width: 96, height: 54, objectFit: 'cover', borderRadius: 6, flexShrink: 0, background: '#1a1a1a' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {c.title && <p style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 4 }}>{c.title}</p>}
                  <p style={{ fontSize: 11, color: '#444', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.youtube_url}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { setEditId(c.id); setEditUrl(c.youtube_url); setEditTitle(c.title ?? '') }} style={F.btnGhost}>Modifier</button>
                  <button onClick={() => handleDelete(c.id)} style={F.btnDanger}>Supprimer</button>
                </div>
              </div>
            )}
          </div>
        ))}
    </div>
  )
}
