'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput } from '@fullcalendar/core'
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
  const [events, setEvents] = useState<EventInput[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('sessions')
      .select('id, title, tier, status, scheduled_at, duration_minutes')
      .then(({ data }) => {
        if (!data) return
        setEvents(
          (data as Session[]).map((session) => {
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
      })
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Campaign Calendar</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        events={events}
        height="auto"
      />
    </main>
  )
}
