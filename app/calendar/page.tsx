'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import { createClient } from '@/lib/supabase/client'

type Session = {
  id: string
  title: string
  tier: number
  status: string
  scheduled_at: string
  duration_minutes: number
}

export default function CalendarPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventInput[]>([])
  const [isDM, setIsDM] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: { user } }, { data: sessions }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('sessions').select('id, title, tier, status, scheduled_at, duration_minutes'),
      ])

      if (sessions) {
        setEvents(
          (sessions as Session[]).map((session) => {
            const start = new Date(session.scheduled_at)
            const end = new Date(start.getTime() + session.duration_minutes * 60_000)
            const color = session.status === 'open' ? '#22c55e' : '#94a3b8'
            return {
              id: session.id,
              title: `${session.title} (Tier ${session.tier})`,
              start: start.toISOString(),
              end: end.toISOString(),
              backgroundColor: color,
              borderColor: color,
            }
          })
        )
      }

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
  }, [])

  function handleEventClick(arg: EventClickArg) {
    router.push(`/sessions/${arg.event.id}`)
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Campaign Calendar</h1>
        {isDM && (
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={() => router.push('/admin/create-session')}
          >
            Post Session
          </button>
        )}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        events={events}
        eventClick={handleEventClick}
        height="auto"
      />
    </main>
  )
}
