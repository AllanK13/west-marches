import Link from 'next/link'

const cards = [
  { href: '/adventures',         icon: '📜', label: 'The Board',       desc: 'Available missions by tier. Choose your next adventure.' },
  { href: '/calendar',           icon: '📅', label: 'Calendar',        desc: 'Scheduled sessions. Sign up before spots are gone.' },
  { href: '/characters',         icon: '⚔',  label: 'The Resistance',  desc: 'Meet the fighters. Upload your character.' },
  { href: '/items',              icon: '🗡',  label: 'Shared Items',    desc: 'Scavenged gear, cursed relics. Items left for all.' },
  { href: '/gold',               icon: '💰', label: 'Gold Pile',       desc: 'Communal fund. Take what you need, leave what you can.' },
  { href: '/board',              icon: '🏴', label: 'Discussion',      desc: 'Threads, rumors, and plans between survivors.' },
  { href: '/character-creation', icon: '📖', label: 'Char. Creation',  desc: 'Rules, starting wealth, feats and platforms.' },
  { href: '/world',              icon: '🌍', label: 'World Overview',  desc: 'History of The Storm. Know the land you fight for.' },
  { href: '/faq',                icon: '❓', label: 'FAQ',             desc: 'Questions about tiers, rules, and how sessions work.' },
]

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid #3d3228', padding: '4rem 1.5rem 3rem', textAlign: 'center', background: 'linear-gradient(180deg, rgba(201,162,39,0.06) 0%, transparent 100%)' }}>
        <p style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#8a7d70', marginBottom: '1rem' }}>
          A West Marches D&D Campaign
        </p>
        <h1 style={{ fontFamily: 'var(--font-cinzel)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9a227', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Battle for the<br />Free Realms
        </h1>
        <p style={{ maxWidth: '640px', margin: '0 auto', color: '#8a7d70', lineHeight: 1.8, fontSize: '0.95rem' }}>
          It&apos;s been over 100 years since The Storm. Those that survived found themselves in a new world —
          desolate, broken, fractured. Five Magic Warlords now rule with iron fists, hoarding power and crushing resistance.
          But deep underground, the fight continues.
        </p>
        <p style={{ maxWidth: '640px', margin: '1.25rem auto 0', color: '#c9a227', lineHeight: 1.8, fontSize: '1rem', fontStyle: 'italic' }}>
          You&apos;ve found The Resistance. Join the fight. Take back what was stolen.
        </p>
      </section>

      {/* Navigation cards */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <h2 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          — Campaign Hub —
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {cards.map(({ href, icon, label, desc }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div
                className="panel"
                style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', transition: 'border-color 0.15s, background 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#c9a227'
                  ;(e.currentTarget as HTMLElement).style.background = '#252220'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3d3228'
                  ;(e.currentTarget as HTMLElement).style.background = '#1c1917'
                }}
              >
                <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c9a227', marginBottom: '0.35rem' }}>
                    {label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#8a7d70', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
