import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <h1>West Marches</h1>
      <Link href="/login">Login</Link>
      <Link href="/calendar">Calendar</Link>
    </main>
  )
}