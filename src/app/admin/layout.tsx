'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const S = {
  root: {
    minHeight: '100vh', display: 'flex', background: '#0c0c0c',
    color: '#d4d4d4', fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: 14,
  } as React.CSSProperties,
  sidebar: {
    width: 230, flexShrink: 0, borderRight: '1px solid #1e1e1e',
    display: 'flex', flexDirection: 'column' as const,
    padding: '36px 0', position: 'sticky' as const, top: 0, height: '100vh', overflow: 'hidden',
  },
  logo: { padding: '0 24px 36px', borderBottom: '1px solid #1e1e1e', marginBottom: 20 },
  logoLabel: { fontSize: 10, letterSpacing: '0.18em', color: '#444', textTransform: 'uppercase' as const, marginBottom: 6, margin: 0 },
  logoTitle: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', margin: 0 },
  nav: { display: 'flex', flexDirection: 'column' as const, gap: 2, padding: '0 12px', flex: 1 },
  link: (active: boolean): React.CSSProperties => ({
    display: 'block', padding: '10px 14px', borderRadius: 8, fontSize: 13,
    textDecoration: 'none', transition: 'all 0.15s', cursor: 'pointer',
    background: active ? '#1c1c1c' : 'transparent',
    color: active ? '#fff' : '#555',
    fontWeight: active ? 500 : 400,
    borderLeft: `2px solid ${active ? '#fff' : 'transparent'}`,
  }),
  footer: { padding: '20px 24px 0', borderTop: '1px solid #1e1e1e', marginTop: 'auto' },
  footerLink: { fontSize: 11, color: '#3a3a3a', textDecoration: 'none', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 5 } as React.CSSProperties,
  main: { flex: 1, overflowY: 'auto' as const, padding: '52px 60px' },
}

const nav = [
  { href: '/admin', label: 'Vue d\'ensemble', exact: true },
  { href: '/admin/landing-videos', label: 'Landing Vidéos' },
  { href: '/admin/clips', label: 'Clips YouTube' },
  { href: '/admin/moodboard', label: 'Moodboard' },
  { href: '/admin/bio', label: 'Bio & Équipe' },
  { href: '/admin/directors', label: 'Directors — Fond' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div style={S.root}>
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <p style={S.logoLabel}>Admin</p>
          <p style={S.logoTitle}>DavidNonos</p>
        </div>
        <nav style={S.nav}>
          {nav.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return <Link key={href} href={href} style={S.link(active)}>{label}</Link>
          })}
        </nav>
        <div style={S.footer}>
          <Link href="/" target="_blank" style={S.footerLink}>
            <span>↗</span> Voir le site
          </Link>
        </div>
      </aside>
      <main style={S.main}>{children}</main>
    </div>
  )
}
