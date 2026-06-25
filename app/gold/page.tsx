'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Transaction = { id: string; player_name: string; amount: number; note: string; created_at: string }

export default function GoldPage() {
  const [total, setTotal] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const [{ data: { user } }, { data: pool }, { data: txs }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('gold_pool').select('amount').eq('id', 1).single(),
        supabase.from('gold_transactions').select('*').order('created_at', { ascending: false }).limit(30),
      ])
      setUserId(user?.id ?? null)
      setUserEmail(user?.email ?? '')
      setTotal((pool as { amount: number } | null)?.amount ?? 0)
      setTransactions((txs ?? []) as Transaction[])
    }
    load()
  }, [])

  async function handleTransaction() {
    const n = parseInt(amount)
    if (!n || n <= 0) return
    if (mode === 'withdraw' && n > total) return alert('Not enough gold in the pile.')
    const supabase = createClient()
    const delta = mode === 'deposit' ? n : -n
    const newTotal = total + delta

    await Promise.all([
      supabase.from('gold_pool').upsert({ id: 1, amount: newTotal }),
      supabase.from('gold_transactions').insert({ player_id: userId, player_name: userEmail.split('@')[0], amount: delta, note }),
    ])

    const tx: Transaction = { id: crypto.randomUUID(), player_name: userEmail.split('@')[0], amount: delta, note, created_at: new Date().toISOString() }
    setTotal(newTotal)
    setTransactions(prev => [tx, ...prev])
    setAmount(''); setNote('')
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      <h1 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Communal Gold Pile</h1>
      <p style={{ color: '#5a4f46', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Shared between all fighters. Take what you need. Leave what you can.
      </p>

      {/* Total */}
      <div className="panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #1c1917, #252220)' }}>
        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#5a4f46', marginBottom: '0.5rem' }}>Current Total</div>
        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '3rem', fontWeight: 900, color: '#c9a227', lineHeight: 1 }}>
          {total.toLocaleString()}
        </div>
        <div style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.8rem', color: '#8a7d70', marginTop: '0.25rem', letterSpacing: '0.15em' }}>GOLD PIECES</div>
      </div>

      {/* Transaction form */}
      {userId ? (
        <div className="panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              className="btn"
              onClick={() => setMode('deposit')}
              style={{ flex: 1, background: mode === 'deposit' ? '#3d6b4a' : 'transparent', color: mode === 'deposit' ? '#e2d9cc' : '#5a4f46', borderColor: mode === 'deposit' ? '#4e8a5e' : '#3d3228' }}
            >
              ↑ Deposit
            </button>
            <button
              className="btn"
              onClick={() => setMode('withdraw')}
              style={{ flex: 1, background: mode === 'withdraw' ? '#7a1f1f' : 'transparent', color: mode === 'withdraw' ? '#e2d9cc' : '#5a4f46', borderColor: mode === 'withdraw' ? '#9b3333' : '#3d3228' }}
            >
              ↓ Withdraw
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label className="input-label">Amount (gp)</label>
              <input className="input" type="number" min="1" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Note (optional)</label>
              <input className="input" placeholder="e.g. From the Gilgax tomb run" value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <button
              className={`btn ${mode === 'deposit' ? 'btn-hope' : 'btn-danger'}`}
              onClick={handleTransaction}
              style={{ alignSelf: 'flex-start' }}
            >
              {mode === 'deposit' ? 'Deposit Gold' : 'Withdraw Gold'}
            </button>
          </div>
        </div>
      ) : (
        <div className="panel" style={{ padding: '1rem', textAlign: 'center', color: '#5a4f46', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          <a href="/login" style={{ color: '#c9a227' }}>Login</a> to deposit or withdraw.
        </div>
      )}

      {/* Transaction log */}
      <h2 className="section-title" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>Recent Transactions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {transactions.length === 0 && (
          <div style={{ color: '#3d3228', fontSize: '0.8rem', fontStyle: 'italic', padding: '0.5rem' }}>No transactions yet.</div>
        )}
        {transactions.map(tx => (
          <div key={tx.id} className="panel" style={{ padding: '0.625rem 0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontSize: '0.75rem', color: '#e2d9cc' }}>{tx.player_name}</span>
              {tx.note && <span style={{ fontSize: '0.75rem', color: '#5a4f46' }}> — {tx.note}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontFamily: 'var(--font-cinzel)', fontWeight: 700, fontSize: '0.9rem', color: tx.amount > 0 ? '#6daa84' : '#9b3333' }}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} gp
              </span>
              <span style={{ fontSize: '0.65rem', color: '#3d3228' }}>{new Date(tx.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
