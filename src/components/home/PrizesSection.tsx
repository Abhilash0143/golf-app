'use client'

import { motion } from 'framer-motion'
import { Trophy, Star, Award } from 'lucide-react'

const tiers = [
  {
    icon: Trophy,
    label: 'Jackpot',
    match: '5 Numbers',
    share: '40%',
    desc: 'Rolls over if no winner',
    highlight: true,
    color: 'text-accent-400',
    border: 'border-accent-400/30',
    bg: 'bg-accent-400/5',
  },
  {
    icon: Star,
    label: '4-Match',
    match: '4 Numbers',
    share: '35%',
    desc: 'Split equally among winners',
    highlight: false,
    color: 'text-brand-400',
    border: 'border-brand-500/20',
    bg: 'bg-brand-500/5',
  },
  {
    icon: Award,
    label: '3-Match',
    match: '3 Numbers',
    share: '25%',
    desc: 'Split equally among winners',
    highlight: false,
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
  },
]

export default function PrizesSection() {
  return (
    <section id="prizes" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-950/20 to-transparent pointer-events-none" />
      <div className="max-w-5xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Prize Structure</h2>
          <p className="text-white/50 text-lg">
            The more numbers you match, the bigger your share of the monthly pool.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 border text-center ${tier.bg} ${tier.border} ${tier.highlight ? 'ring-1 ring-accent-400/30' : ''}`}
            >
              {tier.highlight && (
                <div className="text-xs font-semibold text-accent-400 bg-accent-400/10 rounded-full px-3 py-1 inline-block mb-4">
                  JACKPOT
                </div>
              )}
              <div className={`w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4`}>
                <tier.icon className={`w-8 h-8 ${tier.color}`} />
              </div>
              <h3 className={`text-3xl font-black mb-1 ${tier.color}`}>{tier.share}</h3>
              <p className="text-lg font-semibold text-white mb-2">{tier.label}</p>
              <p className="text-sm text-white/40 mb-3">{tier.match}</p>
              <p className="text-xs text-white/30">{tier.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 glass rounded-2xl p-6 text-center">
          <p className="text-white/50 text-sm">
            Prize pool is calculated from all active subscriptions each month.
            No 5-match winner? The jackpot rolls over and grows for next month.
            All winners split their tier pool equally.
          </p>
        </div>
      </div>
    </section>
  )
}
