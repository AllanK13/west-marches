'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function LoginPage() {
  const supabase = createClient()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' },
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', padding: '0 1.5rem' }}>
      <div className="panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚔</div>
        <h1 style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a227', marginBottom: '0.5rem' }}>
          The Resistance
        </h1>
        <p style={{ fontSize: '0.8rem', color: '#5a4f46', marginBottom: '2rem', lineHeight: 1.6 }}>
          {user ? `Signed in as ${user.email}` : 'Identify yourself, fighter.'}
        </p>

        {user ? (
          <button className="btn btn-danger" onClick={signOut} style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}>
            Leave the Resistance
          </button>
        ) : (
          <button className="btn btn-gold" onClick={signInWithGoogle} style={{ width: '100%', justifyContent: 'center', fontSize: '0.75rem' }}>
            Sign in with Google
          </button>
        )}
      </div>
    </div>
  )
}
