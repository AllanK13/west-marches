'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Thread = {
  id: string
  title: string
  author_name: string
  created_at: string
  post_count?: number
}

export default function BoardPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data: threadData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('threads').select('*, posts(count)').order('created_at', { ascending: false }),
      ])
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? '')
      setThreads((threadData ?? []) as Thread[])
    }
    load()
  }, [])

  async function handlePost() {
    if (!title.trim() || !body.trim()) return
    const supabase = createClient()
    const { data: thread } = await supabase
      .from('threads')
      .insert({ title, author_id: userId, author_name: userEmail.split('@')[0] })
      .select()
      .single()
    if (thread) {
      await supabase.from('posts').insert({ thread_id: thread.id, author_id: userId, author_name: userEmail.split('@')[0], content: body })
      setThreads((prev) => [thread as Thread, ...prev])
      setTitle(''); setBody(''); setShowForm(false)
    }
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 className="section-title" style={{ fontSize: '1.2rem' }}>Discussion Board</h1>
        {userId && (
          <button className="btn btn-gold" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Thread'}
          </button>
        )}
        {!userId && <Link href="/login" className="btn btn-ghost">Login to Post</Link>}
      </div>

      {showForm && (
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: '#c9a227', marginBottom: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>New Thread</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Title</label>
              <input className="input" placeholder="Thread title…" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Opening Post</label>
              <textarea className="input" rows={4} placeholder="What would you like to discuss?" value={body} onChange={e => setBody(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <button className="btn btn-gold" onClick={handlePost} style={{ alignSelf: 'flex-start' }}>Post Thread</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {threads.length === 0 && (
          <div className="panel" style={{ padding: '2rem', textAlign: 'center', color: '#5a4f46' }}>
            No threads yet. Be the first to speak.
          </div>
        )}
        {threads.map((t) => (
          <Link key={t.id} href={`/board/${t.id}`} style={{ textDecoration: 'none' }}>
            <div className="panel" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#c9a227'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#3d3228'}
            >
              <div>
                <div style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 600, color: '#e2d9cc', marginBottom: '0.25rem' }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#5a4f46' }}>
                  {t.author_name} · {new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8a7d70', whiteSpace: 'nowrap', paddingLeft: '1rem' }}>
                replies →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
