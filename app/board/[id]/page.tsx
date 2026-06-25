'use client'

import { use, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Post = { id: string; author_name: string; content: string; created_at: string }
type Thread = { id: string; title: string; author_name: string; created_at: string }

export default function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [thread, setThread] = useState<Thread | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [reply, setReply] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data: threadData }, { data: postData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('threads').select('*').eq('id', id).single(),
        supabase.from('posts').select('*').eq('thread_id', id).order('created_at', { ascending: true }),
      ])
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? '')
      setThread(threadData as Thread)
      setPosts((postData ?? []) as Post[])
    }
    load()
  }, [id])

  async function handleReply() {
    if (!reply.trim()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('posts')
      .insert({ thread_id: id, author_id: userId, author_name: userEmail.split('@')[0], content: reply })
      .select()
      .single()
    if (data) { setPosts(prev => [...prev, data as Post]); setReply('') }
  }

  if (!thread) return <div style={{ padding: '2rem', color: '#5a4f46' }}>Loading…</div>

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{thread.title}</h1>
      <p style={{ fontSize: '0.75rem', color: '#5a4f46', marginBottom: '2rem' }}>
        Started by {thread.author_name} · {new Date(thread.created_at).toLocaleDateString()}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
        {posts.map((p, i) => (
          <div key={p.id} className="panel" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', color: i === 0 ? '#c9a227' : '#8a7d70', fontWeight: 600 }}>
                {p.author_name} {i === 0 && '(OP)'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#5a4f46' }}>{new Date(p.created_at).toLocaleString()}</span>
            </div>
            <p style={{ color: '#e2d9cc', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{p.content}</p>
          </div>
        ))}
      </div>

      {userId ? (
        <div className="panel" style={{ padding: '1.25rem' }}>
          <label className="input-label">Your Reply</label>
          <textarea className="input" rows={4} placeholder="Write your reply…" value={reply} onChange={e => setReply(e.target.value)} style={{ resize: 'vertical', marginBottom: '0.75rem' }} />
          <button className="btn btn-gold" onClick={handleReply}>Post Reply</button>
        </div>
      ) : (
        <div className="panel" style={{ padding: '1rem', textAlign: 'center', color: '#5a4f46', fontSize: '0.85rem' }}>
          <a href="/login" style={{ color: '#c9a227' }}>Login</a> to reply.
        </div>
      )}
    </div>
  )
}
