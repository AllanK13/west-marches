'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/',                   label: 'Home' },
  { href: '/calendar',           label: 'Calendar' },
  { href: '/adventures',         label: 'The Board' },
  { href: '/characters',         label: 'Resistance' },
  { href: '/items',              label: 'Items' },
  { href: '/gold',               label: 'Gold' },
  { href: '/board',              label: 'Discussion' },
  { href: '/character-creation', label: 'Char. Creation' },
  { href: '/world',              label: 'World' },
  { href: '/faq',                label: 'FAQ' },
]

export default function Nav() {
  const pathname = usePathname()
  const [loggedIn, setLoggedIn] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setLoggedIn(!!s))
    return () => subscription.unsubscribe()
  }, [])

  return (
    <nav style={{ background: '#1c1917', borderBottom: '1px solid #3d3228' }}>
      <div className="flex items-center justify-between px-4 py-2 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 900, fontSize: '1rem', letterSpacing: '0.12em', color: '#c9a227', textDecoration: 'none', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          ⚔ The Resistance
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 flex-wrap justify-end">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.3rem 0.6rem',
                borderRadius: '2px',
                textDecoration: 'none',
                color: pathname === href ? '#c9a227' : '#8a7d70',
                background: pathname === href ? 'rgba(201,162,39,0.1)' : 'transparent',
                border: pathname === href ? '1px solid rgba(201,162,39,0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-cinzel)',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '0.3rem 0.75rem',
              borderRadius: '2px',
              textDecoration: 'none',
              marginLeft: '0.5rem',
              color: '#0f0d0c',
              background: '#c9a227',
              border: '1px solid #e8bb30',
            }}
          >
            {loggedIn ? 'Account' : 'Login'}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ color: '#c9a227', background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden flex flex-col px-4 pb-3 gap-1" style={{ borderTop: '1px solid #3d3228' }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: 'var(--font-cinzel)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0.5rem 0.25rem',
                textDecoration: 'none',
                color: pathname === href ? '#c9a227' : '#8a7d70',
                borderBottom: '1px solid #2a2420',
              }}
            >
              {label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 0.25rem', textDecoration: 'none', color: '#c9a227' }}>
            {loggedIn ? 'Account' : 'Login'}
          </Link>
        </div>
      )}
    </nav>
  )
}
