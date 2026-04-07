'use client'

import { useEffect, useRef, useState } from 'react'
import { put } from '@vercel/blob/client'

async function blobUpload(file: File, folder: string): Promise<string> {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pathname: `${folder}/${file.name}`, contentType: file.type }),
  }).then(r => r.json())
  if (res.error) throw new Error(res.error)
  const blob = await put(res.pathname, file, { access: 'public', token: res.token })
  return blob.url
}

interface Collaborator { id: string; name: string; role: string | null }
interface BioData { image_path: string | null; bio_text: string | null; collaborators: Collaborator[] }

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  input: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  textarea: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', resize: 'vertical' as const, minHeight: 130, lineHeight: 1.6 },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnSm: { background: '#fff', color: '#000', border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnGhost: { background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  btnDanger: { background: 'transparent', color: '#e05252', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' },
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 32 } as React.CSSProperties,
  divider: { borderTop: '1px solid #1a1a1a', margin: '32px 0' } as React.CSSProperties,
  row: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' as const },
  collabRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid #1e1e1e', borderRadius: 10, marginBottom: 8 },
}

export default function BioPage() {
  const [data, setData] = useState<BioData | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bioText, setBioText] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  const [newName, setNewName] = useState(''); const [newRole, setNewRole] = useState('')
  const [addingCollab, setAddingCollab] = useState(false)
  const [editCollabId, setEditCollabId] = useState<string | null>(null)
  const [editName, setEditName] = useState(''); const [editRole, setEditRole] = useState('')

  const load = async () => { const r = await fetch('/api/bio'); const d: BioData = await r.json(); setData(d); setBioText(d.bio_text ?? '') }
  useEffect(() => { load() }, [])

  async function saveBio(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(null); setSaved(false)
    try {
      let image_path: string | undefined
      let image_name: string | undefined
      if (imageFile) {
        image_path = await blobUpload(imageFile, 'bio')
        image_name = imageFile.name
      }
      const r = await fetch('/api/bio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio_text: bioText, ...(image_path ? { image_path, image_name } : {}) }),
      })
      if (r.ok) { setImageFile(null); if (imageRef.current) imageRef.current.value = ''; setSaved(true); setTimeout(() => setSaved(false), 2500); await load() }
      else { const d = await r.json(); setError(d.error ?? 'Erreur.') }
    } catch (err) { setError((err as Error).message) }
    setSaving(false)
  }

  async function addCollab(e: React.FormEvent) {
    e.preventDefault(); if (!newName.trim()) return
    setAddingCollab(true)
    await fetch('/api/bio/collaborators', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, role: newRole }) })
    setNewName(''); setNewRole(''); setAddingCollab(false); await load()
  }

  async function saveCollab(id: string) {
    await fetch(`/api/bio/collaborators/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editName, role: editRole }) })
    setEditCollabId(null); await load()
  }

  async function deleteCollab(id: string) {
    if (!confirm('Supprimer ce collaborateur ?')) return
    await fetch(`/api/bio/collaborators/${id}`, { method: 'DELETE' }); await load()
  }

  if (!data) return <p style={{ color: '#444', fontSize: 13 }}>Chargement…</p>

  return (
    <div style={{ maxWidth: 680 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Profil</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>Bio & Équipe</h1>

      {/* Bio form */}
      <form onSubmit={saveBio} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 24 }}>Photo & Biographie</p>

        {/* Image */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          {data.image_path ? (
            <img src={data.image_path} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #222', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 10, border: '1px dashed #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 10, color: '#444' }}>Aucune</span>
            </div>
          )}
          <div style={{ flex: 1 }}>
            <label style={F.label}>Changer la photo</label>
            <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={e => setImageFile(e.target.files?.[0] ?? null)}
              style={{ fontSize: 12, color: '#777', display: 'block' }} />
          </div>
        </div>

        {/* Bio text */}
        <div style={{ marginBottom: 24 }}>
          <label style={F.label}>Texte de bio</label>
          <textarea value={bioText} onChange={e => setBioText(e.target.value)} style={F.textarea} rows={6} />
        </div>

        {error && <p style={{ color: '#e05252', fontSize: 12, marginBottom: 16 }}>{error}</p>}
        {saved && <p style={{ color: '#52c77d', fontSize: 12, marginBottom: 16 }}>✓ Sauvegardé</p>}
        <button type="submit" disabled={saving} style={{ ...F.btn, opacity: saving ? 0.5 : 1 }}>
          {saving ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </form>

      {/* Collaborators */}
      <div style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 24 }}>Collaborateurs</p>

        <form onSubmit={addCollab} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label style={F.label}>Nom *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} required placeholder="Prénom Nom" style={F.input} />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label style={F.label}>Rôle</label>
            <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Directeur créatif" style={F.input} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" disabled={addingCollab || !newName.trim()} style={{ ...F.btnSm, opacity: (addingCollab || !newName.trim()) ? 0.4 : 1 }}>
              Ajouter
            </button>
          </div>
        </form>

        {data.collaborators.length === 0 ? (
          <p style={{ color: '#333', fontSize: 13 }}>Aucun collaborateur.</p>
        ) : (
          data.collaborators.map(c => (
            <div key={c.id} style={F.collabRow}>
              {editCollabId === c.id ? (
                <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={{ ...F.input, width: 'auto', flex: '1 1 130px' }} />
                  <input value={editRole} onChange={e => setEditRole(e.target.value)} placeholder="Rôle" style={{ ...F.input, width: 'auto', flex: '1 1 150px' }} />
                  <button onClick={() => saveCollab(c.id)} style={F.btnSm}>OK</button>
                  <button onClick={() => setEditCollabId(null)} style={F.btnGhost}>✕</button>
                </div>
              ) : (
                <>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5' }}>{c.name}</span>
                    {c.role && <span style={{ fontSize: 12, color: '#555', marginLeft: 10 }}>{c.role}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => { setEditCollabId(c.id); setEditName(c.name); setEditRole(c.role ?? '') }} style={F.btnGhost}>Modifier</button>
                    <button onClick={() => deleteCollab(c.id)} style={F.btnDanger}>✕</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
