import type { Metadata } from 'next'
import { Cinzel } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
})

export const metadata: Metadata = {
  title: 'The Resistance — West Marches',
  description: 'A post-apocalyptic West Marches D&D campaign.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cinzel.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="text-center py-4 text-xs" style={{ color: '#5a4f46', borderTop: '1px solid #3d3228' }}>
          <span style={{ fontFamily: 'var(--font-cinzel)' }}>THE RESISTANCE</span>
          <span className="mx-2">·</span>
          Fight back. Survive. Endure.
        </footer>
      </body>
    </html>
  )
}
