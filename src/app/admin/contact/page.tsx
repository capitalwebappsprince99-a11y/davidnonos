'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: string
  section: string
  name: string | null
  title: string | null
  email: string | null
  phone: string | null
  order_index: number
}

const SECTIONS = [
  { value: 'executives', label: 'Direction' },
  { value: 'music-videos', label: 'Musique Vidéo' },
  { value: 'films-tv', label: 'Films & Séries' },
  { value: 'music', label: 'Musique' },
  { value: 'image', label: 'Image' },
]

const F = {
  label: { fontSize: 11, color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase' as const, display: 'block', marginBottom: 8 },
  input: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  select: { width: '100%', background: '#111', border: '1px solid #222', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#e5e5e5', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit', cursor: 'pointer' },
  btn: { background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnSm: { background: '#fff', color: '#000', border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' } as React.CSSProperties,
  btnGhost: { background: 'transparent', color: '#555', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 16px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  btnDanger: { background: 'transparent', color: '#e05252', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' } as React.CSSProperties,
  section: { border: '1px solid #1e1e1e', borderRadius: 14, padding: '28px 28px 24px', marginBottom: 32 } as React.CSSProperties,
  row: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' as const },
  contactRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', border: '1px solid #1e1e1e', borderRadius: 10, marginBottom: 8, gap: 12 } as React.CSSProperties,
}

const EMPTY_FORM = { section: 'executives', name: '', title: '', email: '', phone: '', order_index: 0 }

export default function AdminContactPage() {
  const [address, setAddress] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [savedAddress, setSavedAddress] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  const load = async () => {
    const r = await fetch('/api/contact')
    const d = await r.json()
    setAddress(d.info?.address ?? '')
    setContacts(d.contacts)
  }

  useEffect(() => { load() }, [])

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)
    await fetch('/api/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address }) })
    setSavingAddress(false)
    setSavedAddress(true)
    setTimeout(() => setSavedAddress(false), 2500)
  }

  async function addContact(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    await fetch('/api/contact/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm(EMPTY_FORM)
    setAdding(false)
    await load()
  }

  async function saveEdit(id: string) {
    await fetch(`/api/contact/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditId(null)
    await load()
  }

  async function deleteContact(id: string) {
    if (!confirm('Supprimer ce contact ?')) return
    await fetch(`/api/contact/contacts/${id}`, { method: 'DELETE' })
    await load()
  }

  const bySection = SECTIONS.reduce<Record<string, Contact[]>>((acc, s) => {
    acc[s.value] = contacts.filter(c => c.section === s.value)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 780 }}>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Pages</p>
      <h1 style={{ fontSize: 26, fontWeight: 600, color: '#fff', marginBottom: 40, letterSpacing: '-0.02em' }}>Contact</h1>

      {/* Address */}
      <form onSubmit={saveAddress} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 24 }}>Adresse</p>
        <div style={{ marginBottom: 20 }}>
          <label style={F.label}>Adresse postale</label>
          <input value={address} onChange={e => setAddress(e.target.value)} style={F.input} placeholder="28 RUE CHATEAUDUN 75009 PARIS" />
        </div>
        {savedAddress && <p style={{ color: '#52c77d', fontSize: 12, marginBottom: 16 }}>✓ Sauvegardé</p>}
        <button type="submit" disabled={savingAddress} style={{ ...F.btn, opacity: savingAddress ? 0.5 : 1 }}>
          {savingAddress ? 'Sauvegarde…' : 'Enregistrer'}
        </button>
      </form>

      {/* Add contact */}
      <form onSubmit={addContact} style={F.section}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 24 }}>Ajouter un contact</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={F.label}>Section *</label>
            <select value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} style={F.select}>
              {SECTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={F.label}>Ordre</label>
            <input type="number" value={form.order_index} onChange={e => setForm(f => ({ ...f, order_index: Number(e.target.value) }))} style={F.input} min={0} />
          </div>
          <div>
            <label style={F.label}>Nom</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={F.input} placeholder="Prénom Nom" />
          </div>
          <div>
            <label style={F.label}>Titre / Fonction</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={F.input} placeholder="Head of Music" />
          </div>
          <div>
            <label style={F.label}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={F.input} placeholder="contact@example.tv" />
          </div>
          <div>
            <label style={F.label}>Téléphone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={F.input} placeholder="+33 1 23 45 67 89" />
          </div>
        </div>
        <button type="submit" disabled={adding} style={{ ...F.btnSm, opacity: adding ? 0.4 : 1 }}>
          Ajouter
        </button>
      </form>

      {/* Contacts by section */}
      {SECTIONS.map(s => {
        const list = bySection[s.value]
        if (!list || list.length === 0) return null
        return (
          <div key={s.value} style={F.section}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#ccc', marginBottom: 20 }}>{s.label}</p>
            {list.map(c => (
              <div key={c.id} style={F.contactRow}>
                {editId === c.id ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Section</label>
                      <select value={editForm.section} onChange={e => setEditForm(f => ({ ...f, section: e.target.value }))} style={{ ...F.select, padding: '8px 12px' }}>
                        {SECTIONS.map(s2 => <option key={s2.value} value={s2.value}>{s2.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Ordre</label>
                      <input type="number" value={editForm.order_index} onChange={e => setEditForm(f => ({ ...f, order_index: Number(e.target.value) }))} style={{ ...F.input, padding: '8px 12px' }} min={0} />
                    </div>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Nom</label>
                      <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ ...F.input, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Titre</label>
                      <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ ...F.input, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Email</label>
                      <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={{ ...F.input, padding: '8px 12px' }} />
                    </div>
                    <div>
                      <label style={{ ...F.label, marginBottom: 4 }}>Téléphone</label>
                      <input type="tel" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} style={{ ...F.input, padding: '8px 12px' }} />
                    </div>
                    <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8, marginTop: 4 }}>
                      <button onClick={() => saveEdit(c.id)} style={F.btnSm}>Sauvegarder</button>
                      <button onClick={() => setEditId(null)} style={F.btnGhost}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {c.name && <span style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', marginRight: 8 }}>{c.name}</span>}
                      {c.title && <span style={{ fontSize: 12, color: '#555' }}>{c.title}</span>}
                      <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
                        {c.email && <span style={{ fontSize: 11, color: '#3a3a3a' }}>{c.email}</span>}
                        {c.phone && <span style={{ fontSize: 11, color: '#3a3a3a' }}>{c.phone}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => {
                        setEditId(c.id)
                        setEditForm({
                          section: c.section,
                          name: c.name ?? '',
                          title: c.title ?? '',
                          email: c.email ?? '',
                          phone: c.phone ?? '',
                          order_index: c.order_index,
                        })
                      }} style={F.btnGhost}>Modifier</button>
                      <button onClick={() => deleteContact(c.id)} style={F.btnDanger}>✕</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
