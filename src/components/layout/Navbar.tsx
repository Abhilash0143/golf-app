'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Menu, X, Heart } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-lg gradient-text">GolfGive</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</Link>
            <Link href="#charity" className="text-sm text-white/60 hover:text-white transition-colors">Charities</Link>
            <Link href="#prizes" className="text-sm text-white/60 hover:text-white transition-colors">Prizes</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Subscribe Now</Button>
            </Link>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden text-white/60 hover:text-white">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" className="text-white/70" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="#charity" className="text-white/70" onClick={() => setOpen(false)}>Charities</Link>
          <Link href="#prizes" className="text-white/70" onClick={() => setOpen(false)}>Prizes</Link>
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full">Sign In</Button>
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)}>
            <Button className="w-full">Subscribe Now</Button>
          </Link>
        </div>
      )}
    </nav>
  )
}
