import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GolfGive — Play Golf. Change Lives.',
  description: 'A subscription platform where your golf scores enter you into monthly prize draws while supporting charity.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark-900 text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
