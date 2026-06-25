'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Adventure = { id: string; name: string; location: string; description: string; tier: number; status: string; created_at: string }

const TIER_LABELS: Record<number, string> = { 1: 'Tier I — Burconaland', 2: 'Tier II — The Underground', 3: 'Tier III — Mid-level Management', 4: 'Tier IV — Targeted Searching', 5: 'Tier V — Final Bosses' }
const TIERS = [1, 2, 3, 4, 5]

export default function AdventuresPage() {
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [isDM, setIsDM] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [sortCompleted, setSortCompleted] = useState<'alpha' | 'tier'>('tier')
  const [form, setForm] = useState({ name: '', location: '', description: '', tier: 1 })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('adventures').select('*').order('tier').order('created_at'),
      ])
      setUserId(user?.id ?? null)
      setAdventures((data ?? []) as Adventure[])
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setIsDM(profile?.role === 'dm')
      }
    }
    load()
  }, [])

  async function handleAdd() {
    if (!form.name.trim()) return
    const supabase = createClient()
    const { data } = await supabase.from('adventures').insert({ ...form, status: 'active' }).select().single()
    if (data) setAdventures(prev => [...prev, data as Adventure].sort((a, b) => a.tier - b.tier))
    setForm({ name: '', location: '', description: '', tier: 1 }); setShowForm(false)
  }

  async function markComplete(id: string) {
    const supabase = createClient()
    await supabase.from('adventures').update({ status: 'completed' }).eq('id', id)
    setAdventures(prev => prev.map(a => a.id === id ? { ...a, status: 'completed' } : a))
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove "${name}"?`)) return
    const supabase = createClient()
    await supabase.from('adventures').delete().eq('id', id)
    setAdventures(prev => prev.filter(a => a.id !== id))
  }

  const active = adventures.filter(a => a.status === 'active')
  const completed = adventures.filter(a => a.status === 'completed')
  const sortedCompleted = [...completed].sort((a, b) =>
    sortCompleted === 'alpha' ? a.name.localeCompare(b.name) : a.tier - b.tier
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.2rem' }}>The Board</h1>
        {isDM && (
          <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Post Adventure'}
          </button>
        )}
      </div>
      <p style={{ color: '#5a4f46', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Choose your mission. Higher tiers must be unlocked through play.
      </p>

      {showForm && isDM && (
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: '#c9a227', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Adventure</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Name *</label>
              <input className="input" placeholder="Adventure name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Location</label>
              <input className="input" placeholder="Where is it?" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Tier</label>
              <select className="input" value={form.tier} onChange={e => setForm({ ...form, tier: +e.target.value })}>
                {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Description</label>
              <textarea className="input" rows={3} placeholder="Brief description of the mission…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleAdd} style={{ marginTop: '1rem' }}>Post to Board</button>
        </div>
      )}

      {/* Active adventures by tier */}
      {TIERS.map(tier => {
        const tierAdventures = active.filter(a => a.tier === tier)
        return (
          <div key={tier} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span className={`tier-badge tier-${tier}`}>Tier {tier}</span>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', color: '#5a4f46', letterSpacing: '0.08em' }}>
                {TIER_LABELS[tier].split('—')[1]?.trim()}
              </span>
              <div style={{ flex: 1, borderTop: '1px solid #3d3228' }} />
            </div>
            {tierAdventures.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', color: '#3d3228', fontSize: '0.8rem', fontStyle: 'italic' }}>
                <span style={{ fontSize: '1rem' }}>🔒</span> No missions available at this tier.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tierAdventures.map(adv => (
                  <div key={adv.id} className="panel" style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: '#c9a227', marginBottom: '0.2rem' }}>{adv.name}</div>
                        {adv.location && <div style={{ fontSize: '0.7rem', color: '#8a7d70', marginBottom: '0.4rem' }}>📍 {adv.location}</div>}
                        {adv.description && <p style={{ fontSize: '0.85rem', color: '#9c8f82', lineHeight: 1.65 }}>{adv.description}</p>}
                      </div>
                      {isDM && (
                        <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                          <button className="btn btn-hope" onClick={() => markComplete(adv.id)} style={{ fontSize: '0.6rem', padding: '0.25rem 0.6rem' }}>✓ Done</button>
                          <button className="btn btn-danger" onClick={() => handleDelete(adv.id, adv.name)} style={{ fontSize: '0.6rem', padding: '0.25rem 0.6rem' }}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* Completed */}
      {completed.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <hr className="divider" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 className="section-title" style={{ fontSize: '0.8rem' }}>Completed Missions</h2>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-ghost" onClick={() => setSortCompleted('tier')} style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderColor: sortCompleted === 'tier' ? '#c9a227' : '#3d3228', color: sortCompleted === 'tier' ? '#c9a227' : '#5a4f46' }}>By Tier</button>
              <button className="btn btn-ghost" onClick={() => setSortCompleted('alpha')} style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderColor: sortCompleted === 'alpha' ? '#c9a227' : '#3d3228', color: sortCompleted === 'alpha' ? '#c9a227' : '#5a4f46' }}>A–Z</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {sortedCompleted.map(adv => (
              <div key={adv.id} className="panel" style={{ padding: '0.75rem 1.25rem', opacity: 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`tier-badge tier-${adv.tier}`}>T{adv.tier}</span>
                  <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.85rem', color: '#8a7d70', textDecoration: 'line-through' }}>{adv.name}</span>
                  {adv.location && <span style={{ fontSize: '0.7rem', color: '#3d3228' }}>— {adv.location}</span>}
                  {isDM && <button className="btn btn-danger" onClick={() => handleDelete(adv.id, adv.name)} style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>✕</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
