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

interface ContactInfo {
  address: string | null
}

const SECTION_LABELS: Record<string, string> = {
  executives: 'Direction',
  'music-videos': 'Musique Vidéo',
  'films-tv': 'Films & Séries',
  music: 'Musique',
  image: 'Image',
}

const SECTION_ORDER = ['executives', 'music-videos', 'films-tv', 'music', 'image']

export default function ContactPage() {
  const [info, setInfo] = useState<ContactInfo | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    fetch('/api/contact')
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { setInfo(d.info); setContacts(d.contacts) })
      .catch(() => {})
  }, [])

  const bySection = SECTION_ORDER.reduce<Record<string, Contact[]>>((acc, s) => {
    acc[s] = contacts.filter(c => c.section === s)
    return acc
  }, {})

  return (
    <div className="contact-page">
      {info?.address && (
        <p className="contact-address">{info.address}</p>
      )}

      <div className="contact-grid">
        {SECTION_ORDER.map(section => {
          const list = bySection[section]
          if (!list || list.length === 0) return null
          return (
            <div key={section} className="contact-section">
              <h3>{SECTION_LABELS[section] ?? section}</h3>
              {list.map(c => (
                <div key={c.id} className="contact-person">
                  {c.name && <p className="name">{c.name}</p>}
                  {c.title && <p className="title">{c.title}</p>}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="email">{c.email}</a>
                  )}
                  {c.phone && (
                    <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="phone">{c.phone}</a>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
