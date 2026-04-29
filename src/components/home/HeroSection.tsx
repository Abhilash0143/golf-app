'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Heart, Trophy, ArrowRight, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Donated to Charity', value: '£142,000+' },
  { label: 'Active Members', value: '2,400+' },
  { label: 'Prize Draws Run', value: '38' },
  { label: 'Winners Paid Out', value: '£86,000+' },
]

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-accent-400/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/30 text-brand-400 text-sm font-medium mb-8"
        >
          <Heart className="w-4 h-4" fill="currentColor" />
          Every score makes a difference
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight"
        >
          Play Golf.{' '}
          <span className="gradient-text">Change Lives.</span>
          <br />Win Big.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Your monthly subscription enters your golf scores into prize draws — while automatically
          funding the charity you care about most. Golf is the mechanism. Impact is the mission.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto shadow-2xl shadow-brand-500/30">
              Start Giving — From £10/mo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              How It Works
            </Button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-2xl p-5 text-center">
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Prize preview badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-8 left-4 hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-3"
      >
        <Trophy className="w-4 h-4 text-accent-400" />
        <span className="text-sm text-white/70">This month&apos;s jackpot:</span>
        <span className="text-sm font-bold text-accent-400">£4,200</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 right-4 hidden lg:flex items-center gap-2 glass rounded-xl px-4 py-3"
      >
        <TrendingUp className="w-4 h-4 text-brand-400" />
        <span className="text-sm text-white/70">Charity raised this month:</span>
        <span className="text-sm font-bold text-brand-400">£1,840</span>
      </motion.div>
    </section>
  )
}
