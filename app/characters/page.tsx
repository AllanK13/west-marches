'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

type Character = {
  id: string
  player_id: string
  name: string
  race: string
  class: string
  bio: string
  image_url: string
  created_at: string
}

const DEFAULT_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%231c1917" width="200" height="200"/%3E%3Ctext x="100" y="115" text-anchor="middle" font-size="72" fill="%233d3228"%3E⚔%3C/text%3E%3C/svg%3E'

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ name: '', race: '', class: '', bio: '' })

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('characters').select('*').order('created_at', { ascending: false }),
      ])
      setUserId(user?.id ?? null)
      setCharacters((data ?? []) as Character[])
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
      const { data: uploaded } = await supabase.storage.from('characters').upload(path, file, { upsert: true })
      if (uploaded) {
        const { data: { publicUrl } } = supabase.storage.from('characters').getPublicUrl(uploaded.path)
        image_url = publicUrl
      }
    }

    const { data } = await supabase
      .from('characters')
      .insert({ ...form, player_id: userId, image_url })
      .select()
      .single()
    if (data) {
      setCharacters(prev => [data as Character, ...prev])
      setForm({ name: '', race: '', class: '', bio: '' })
      if (fileRef.current) fileRef.current.value = ''
      setShowForm(false)
    }
    setUploading(false)
  }

  async function handleDelete(char: Character) {
    if (!confirm(`Remove ${char.name} from the roster?`)) return
    const supabase = createClient()
    await supabase.from('characters').delete().eq('id', char.id)
    setCharacters(prev => prev.filter(c => c.id !== char.id))
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="section-title" style={{ fontSize: '1.2rem' }}>Meet the Resistance</h1>
          <p style={{ color: '#5a4f46', fontSize: '0.8rem', marginTop: '0.25rem' }}>Every fighter has a story. This is theirs.</p>
        </div>
        {userId && (
          <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Character'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: '#c9a227', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Fighter</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Name *</label>
              <input className="input" placeholder="Character name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Race</label>
              <input className="input" placeholder="e.g. Half-Elf" value={form.race} onChange={e => setForm({ ...form, race: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Class</label>
              <input className="input" placeholder="e.g. Ranger" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Portrait Image</label>
              <input ref={fileRef} type="file" accept="image/*" className="input" style={{ paddingTop: '0.35rem' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Bio</label>
              <textarea className="input" rows={3} placeholder="Who are they? What drives them to fight?" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <button className="btn btn-gold" onClick={handleSubmit} disabled={uploading} style={{ marginTop: '1rem' }}>
            {uploading ? 'Uploading…' : 'Add to Roster'}
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {characters.length === 0 && (
          <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#5a4f46', gridColumn: '1/-1' }}>
            The roster is empty. Be the first to join the fight.
          </div>
        )}
        {characters.map((c) => (
          <div key={c.id} className="panel" style={{ overflow: 'hidden' }}>
            <img
              src={c.image_url || DEFAULT_IMAGE}
              alt={c.name}
              style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block', borderBottom: '1px solid #3d3228' }}
            />
            <div style={{ padding: '1rem' }}>
              <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, color: '#c9a227', marginBottom: '0.2rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#8a7d70', marginBottom: '0.5rem' }}>
                {[c.race, c.class].filter(Boolean).join(' · ')}
              </div>
              {c.bio && <p style={{ fontSize: '0.8rem', color: '#9c8f82', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.bio}</p>}
              {userId === c.player_id && (
                <button className="btn btn-danger" onClick={() => handleDelete(c)} style={{ marginTop: '0.75rem', fontSize: '0.65rem' }}>Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
