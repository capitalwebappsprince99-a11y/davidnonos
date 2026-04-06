'use client'

import Link from 'next/link'

const sections = [
  { href: '/admin/landing-videos', title: 'Landing Vidéos', desc: 'Vidéos de la page d\'accueil — titre, sous-titre, fichier.' },
  { href: '/admin/clips', title: 'Clips YouTube', desc: 'Liens YouTube affichés dans la section Clips.' },
  { href: '/admin/moodboard', title: 'Moodboard', desc: 'Photos de la galerie moodboard.' },
  { href: '/admin/bio', title: 'Bio & Équipe', desc: 'Photo, texte bio et noms des collaborateurs.' },
  { href: '/admin/directors', title: 'Directors — Fond', desc: 'Vidéo en arrière-plan de la page Directors.' },
]

export default function AdminDashboard() {
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase', marginBottom: 10 }}>Vue d'ensemble</p>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: '#fff', marginBottom: 6, letterSpacing: '-0.02em' }}>Contenu du site</h1>
      <p style={{ fontSize: 13, color: '#555', marginBottom: 48 }}>Gérez et mettez à jour chaque section.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 680 }}>
        {sections.map(({ href, title, desc }) => (
          <Link key={href} href={href} style={{
            display: 'block', border: '1px solid #1e1e1e', borderRadius: 12,
            padding: '28px 24px', textDecoration: 'none', color: 'inherit',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#333'; (e.currentTarget as HTMLElement).style.background = '#141414' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e1e1e'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <p style={{ fontSize: 14, fontWeight: 500, color: '#e5e5e5', marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
