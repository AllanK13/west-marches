'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Item = {
  id: string
  owner_id: string
  owner_name: string
  name: string
  subtitle: string
  description: string
  tier: number
  image_url: string
  created_at: string
}

const TIER_LABELS: Record<number, string> = { 1: 'Tier I', 2: 'Tier II', 3: 'Tier III', 4: 'Tier IV', 5: 'Tier V' }
const TIERS = [1, 2, 3, 4, 5]

const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%231c1917" width="200" height="200"/%3E%3Ctext x="100" y="115" text-anchor="middle" font-size="72" fill="%233d3228"%3E🗡%3C/text%3E%3C/svg%3E'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [isDM, setIsDM] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: '', subtitle: '', description: '', tier: 1 })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('items').select('*').order('tier').order('created_at', { ascending: false }),
      ])
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? '')
      setItems((data ?? []) as Item[])
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        setIsDM(profile?.role === 'dm')
      }
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!form.name.trim()) return
    setUploading(true)
    const supabase = createClient()
    let image_url = ''

    const file = fileRef.current?.files?.[0]
    if (file) {
      const path = `${userId}/${Date.now()}-${file.name}`
      const { data: uploaded } = await supabase.storage.from('items').upload(path, file, { upsert: true })
      if (uploaded) {
        const { data: { publicUrl } } = supabase.storage.from('items').getPublicUrl(uploaded.path)
        image_url = publicUrl
      }
    }

    const { data } = await supabase
      .from('items')
      .insert({ ...form, owner_id: userId, owner_name: userEmail.split('@')[0], image_url })
      .select()
      .single()
    if (data) {
      setItems(prev => [data as Item, ...prev].sort((a, b) => a.tier - b.tier))
      setForm({ name: '', subtitle: '', description: '', tier: 1 })
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
    }
    setUploading(false)
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Remove "${item.name}" from the stash?`)) return
    const supabase = createClient()
    await supabase.from('items').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const itemsByTier = TIERS.map(t => ({ tier: t, items: items.filter(i => i.tier === t) }))

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.2rem' }}>Shared Items</h1>
        {userId && (
          <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Item'}
          </button>
        )}
      </div>
      <p style={{ color: '#5a4f46', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
        Scavenged gear left for the resistance. To use an item it must be your tier or lower.
      </p>

      {showForm && (
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: '#c9a227', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Add to the Stash</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Name *</label>
              <input className="input" placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Subtitle</label>
              <input className="input" placeholder="e.g. Weapon (longsword), rare" value={form.subtitle} onChange={e => setForm({ ...form, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Tier</label>
              <select className="input" value={form.tier} onChange={e => setForm({ ...form, tier: +e.target.value })}>
                {TIERS.map(t => <option key={t} value={t}>Tier {t}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Image</label>
              <input ref={fileRef} type="file" accept="image/*" className="input" style={{ paddingTop: '0.35rem' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Description</label>
              <textarea className="input" rows={3} placeholder="Properties, flavor text, attunement requirements…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={uploading} style={{ marginTop: '1rem' }}>
            {uploading ? 'Uploading…' : 'Add Item'}
          </button>
        </div>
      )}

      {itemsByTier.map(({ tier, items: tierItems }) => (
        <div key={tier} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className={`tier-badge tier-${tier}`}>{TIER_LABELS[tier]}</span>
            <div style={{ flex: 1, borderTop: '1px solid #3d3228' }} />
            <span style={{ fontSize: '0.7rem', color: '#5a4f46' }}>{tierItems.length} item{tierItems.length !== 1 ? 's' : ''}</span>
          </div>
          {tierItems.length === 0 ? (
            <p style={{ color: '#3d3228', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '0.5rem' }}>No items yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
              {tierItems.map(item => (
                <div key={item.id} className="panel" style={{ overflow: 'hidden' }}>
                  {item.image_url && (
                    <img src={item.image_url || DEFAULT_IMAGE} alt={item.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderBottom: '1px solid #3d3228' }} />
                  )}
                  <div style={{ padding: '0.875rem' }}>
                    <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: '#e2d9cc', fontSize: '0.9rem' }}>{item.name}</div>
                    {item.subtitle && <div style={{ fontSize: '0.7rem', color: '#8a7d70', fontStyle: 'italic', margin: '0.15rem 0 0.5rem' }}>{item.subtitle}</div>}
                    {item.description && <p style={{ fontSize: '0.8rem', color: '#9c8f82', lineHeight: 1.6 }}>{item.description}</p>}
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', color: '#5a4f46' }}>left by {item.owner_name}</span>
                      {(userId === item.owner_id || isDM) && (
                        <button className="btn btn-danger" onClick={() => handleDelete(item)} style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>Remove</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
