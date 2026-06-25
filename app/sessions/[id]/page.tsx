'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  title: string
  tier: number
  status: string
  scheduled_at: string
  duration_minutes: number
  party_cap: number
  is_online: boolean
  location: string
}

type Rsvp = {
  id: string
  session_id: string
  player_id: string
  status: string
}

type EditForm = {
  title: string
  scheduled_at: string
  party_cap: number
  tier: number
  is_online: boolean
  location: string
}

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [rsvps, setRsvps] = useState<Rsvp[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [isDM, setIsDM] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<EditForm>({
    title: '',
    scheduled_at: '',
    party_cap: 5,
    tier: 1,
    is_online: true,
    location: '',
  })

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: { user } }, { data: sessionData }, { data: rsvpData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('sessions').select('*').eq('id', id).single(),
        supabase.from('session_rsvps').select('*').eq('session_id', id),
      ])

      setUserId(user?.id ?? null)
      setSession(sessionData)
      setRsvps(rsvpData ?? [])

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setIsDM(profile?.role === 'dm')
      }
    }

    load()
  }, [id])

  const confirmedRsvps = rsvps.filter((r) => r.status === 'confirmed')
  const waitlistRsvps = rsvps.filter((r) => r.status === 'waitlist')
  const myRsvp = rsvps.find((r) => r.player_id === userId)
  const isFull = session ? confirmedRsvps.length >= session.party_cap : false

  async function handleRsvp() {
    const supabase = createClient()
    if (myRsvp) {
      await supabase.from('session_rsvps').delete().eq('id', myRsvp.id)
      setRsvps((prev) => prev.filter((r) => r.id !== myRsvp.id))
    } else {
      const status = isFull ? 'waitlist' : 'confirmed'
      const { data } = await supabase
        .from('session_rsvps')
        .insert({ session_id: id, player_id: userId, status })
        .select()
        .single()
      if (data) setRsvps((prev) => [...prev, data as Rsvp])
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this session and all RSVPs?')) return
    const supabase = createClient()
    await supabase.from('session_rsvps').delete().eq('session_id', id)
    await supabase.from('sessions').delete().eq('id', id)
    router.push('/calendar')
  }

  function startEditing() {
    if (!session) return
    setEditForm({
      title: session.title,
      scheduled_at: session.scheduled_at.slice(0, 16),
      party_cap: session.party_cap,
      tier: session.tier,
      is_online: session.is_online,
      location: session.location ?? '',
    })
    setEditing(true)
  }

  async function handleSave() {
    const supabase = createClient()
    const { data } = await supabase
      .from('sessions')
      .update(editForm)
      .eq('id', id)
      .select()
      .single()
    if (data) setSession(data as Session)
    setEditing(false)
  }

  if (!session) return <main className="p-6">Loading...</main>

  if (editing) {
    return (
      <main className="p-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Edit Session</h1>
        <div className="flex flex-col gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Title"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            type="datetime-local"
            value={editForm.scheduled_at}
            onChange={(e) => setEditForm({ ...editForm, scheduled_at: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            type="number"
            placeholder="Party Cap"
            value={editForm.party_cap}
            onChange={(e) => setEditForm({ ...editForm, party_cap: +e.target.value })}
          />
          <select
            className="border p-2 rounded"
            value={editForm.tier}
            onChange={(e) => setEditForm({ ...editForm, tier: +e.target.value })}
          >
            {[1, 2, 3, 4, 5].map((t) => (
              <option key={t} value={t}>Tier {t}</option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editForm.is_online}
              onChange={(e) => setEditForm({ ...editForm, is_online: e.target.checked })}
            />
            Online Session
          </label>
          {!editForm.is_online && (
            <input
              className="border p-2 rounded"
              placeholder="Location"
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
            />
          )}
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white p-2 rounded flex-1" onClick={handleSave}>
              Save
            </button>
            <button className="bg-gray-200 p-2 rounded flex-1" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-1">{session.title}</h1>
      <p className="text-gray-600 mb-4">Tier {session.tier}</p>
      <div className="flex flex-col gap-1 mb-4">
        <p>{new Date(session.scheduled_at).toLocaleString()}</p>
        <p>{session.is_online ? 'Online' : session.location}</p>
        <p>Party: {confirmedRsvps.length} / {session.party_cap}</p>
        <p>Waitlist: {waitlistRsvps.length}</p>
      </div>

      {userId && !isDM && (
        <button
          className={`p-2 px-4 rounded text-white ${myRsvp ? 'bg-red-500' : 'bg-green-600'}`}
          onClick={handleRsvp}
        >
          {myRsvp ? 'Cancel RSVP' : isFull ? 'Join Waitlist' : 'RSVP'}
        </button>
      )}

      {isDM && (
        <div className="mt-4 flex gap-2">
          <button className="bg-blue-600 text-white p-2 px-4 rounded" onClick={startEditing}>
            Edit
          </button>
          <button className="bg-red-500 text-white p-2 px-4 rounded" onClick={handleDelete}>
            Delete
          </button>
        </div>
      )}
    </main>
  )
}
