'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CreateSession() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    scheduled_at: '',
    duration_minutes: 240,
    party_cap: 5,
    tier: 1,
    is_online: true,
    location: ''
  })

  async function handleSubmit() {
    const { error } = await supabase.from('sessions').insert([form])
    if (!error) router.push('/calendar')
    else console.error(error)
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Post a Session</h1>
      <div className="flex flex-col gap-4">
        <input className="border p-2 rounded" placeholder="Session Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        <input className="border p-2 rounded" type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} />
        <input className="border p-2 rounded" type="number" placeholder="Duration (minutes)" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: +e.target.value})} />
        <input className="border p-2 rounded" type="number" placeholder="Party Cap" value={form.party_cap} onChange={e => setForm({...form, party_cap: +e.target.value})} />
        <select className="border p-2 rounded" value={form.tier} onChange={e => setForm({...form, tier: +e.target.value})}>
          <option value={1}>Tier 1 (Levels 1-4)</option>
          <option value={2}>Tier 2 (Levels 5-8)</option>
          <option value={3}>Tier 3 (Levels 9-12)</option>
          <option value={4}>Tier 4 (Levels 13-16)</option>
          <option value={5}>Tier 5 (Levels 17-20)</option>
        </select>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.is_online} onChange={e => setForm({...form, is_online: e.target.checked})} />
          Online Session
        </label>
        {!form.is_online && <input className="border p-2 rounded" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />}
        <button className="bg-green-600 text-white p-2 rounded" onClick={handleSubmit}>Post Session</button>
      </div>
    </main>
  )
}