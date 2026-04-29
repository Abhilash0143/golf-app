import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" fill="white" />
          </div>
          <span className="font-bold gradient-text">GolfGive</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/40">
          <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          <Link href="/signup" className="hover:text-white transition-colors">Subscribe</Link>
          <span>© 2026 GolfGive. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}
