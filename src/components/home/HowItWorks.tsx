'use client'

import { motion } from 'framer-motion'
import { CreditCard, Target, Dices, Trophy } from 'lucide-react'

const steps = [
  {
    icon: CreditCard,
    step: '01',
    title: 'Subscribe',
    desc: 'Choose monthly (£10) or yearly (£100). A portion funds the prize pool, a portion goes directly to your chosen charity.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
  },
  {
    icon: Target,
    step: '02',
    title: 'Enter Your Scores',
    desc: 'Submit up to 5 Stableford scores (1–45) each month. These become your lottery numbers for the monthly draw.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Dices,
    step: '03',
    title: 'Monthly Draw',
    desc: 'Every month, 5 numbers are drawn. Match 3, 4, or all 5 of your scores to win your tier of the prize pool.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Trophy,
    step: '04',
    title: 'Win & Verify',
    desc: 'Winners upload their score proof. Admin verifies and pays out. Jackpots roll over when there\'s no 5-match winner.',
    color: 'text-accent-400',
    bg: 'bg-accent-400/10',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Four simple steps to play golf, support charity, and win prizes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 relative"
            >
              <div className="absolute top-4 right-4 text-5xl font-black text-white/5">
                {step.step}
              </div>
              <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                <step.icon className={`w-6 h-6 ${step.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
