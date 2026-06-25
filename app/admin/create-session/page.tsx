'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CreateSession() {
  const router = useRouter()
  const [dmId, setDmId] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const [form, setForm] = useState({
    title: '',
    scheduled_at: '',
    duration_minutes: 240,
    party_cap: 5,
    tier: 1,
    is_online: true,
    location: '',
  })

  useEffect(() => {
    const supabase = createClient()
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAuthorized(false); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role === 'dm') {
        setDmId(user.id)
        setAuthorized(true)
      } else {
        setAuthorized(false)
      }
    }
    checkAuth()
  }, [])

  async function handleSubmit() {
    const supabase = createClient()
    const { error } = await supabase.from('sessions').insert([{ ...form, dm_id: dmId }])
    if (!error) router.push('/calendar')
    else console.error(error)
  }

  if (authorized === null) return <main className="p-6">Loading...</main>
  if (!authorized) return <main className="p-6">Access denied.</main>

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Post a Session</h1>
      <div className="flex flex-col gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Session Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="datetime-local"
          value={form.scheduled_at}
          onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Duration (minutes)"
          value={form.duration_minutes}
          onChange={(e) => setForm({ ...form, duration_minutes: +e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          placeholder="Party Cap"
          value={form.party_cap}
          onChange={(e) => setForm({ ...form, party_cap: +e.target.value })}
        />
        <select
          className="border p-2 rounded"
          value={form.tier}
          onChange={(e) => setForm({ ...form, tier: +e.target.value })}
        >
          <option value={1}>Tier 1 (Levels 1-4)</option>
          <option value={2}>Tier 2 (Levels 5-8)</option>
          <option value={3}>Tier 3 (Levels 9-12)</option>
          <option value={4}>Tier 4 (Levels 13-16)</option>
          <option value={5}>Tier 5 (Levels 17-20)</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_online}
            onChange={(e) => setForm({ ...form, is_online: e.target.checked })}
          />
          Online Session
        </label>
        {!form.is_online && (
          <input
            className="border p-2 rounded"
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        )}
        <button className="bg-green-600 text-white p-2 rounded" onClick={handleSubmit}>
          Post Session
        </button>
      </div>
    </main>
  )
}
