'use client'

import { motion } from 'framer-motion'
import { Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

const charities = [
  { name: 'Macmillan Cancer Support', raised: '£24,000', category: 'Health' },
  { name: 'Mental Health Foundation', raised: '£18,500', category: 'Wellbeing' },
  { name: 'The Trussell Trust', raised: '£31,200', category: 'Food Poverty' },
  { name: "Children's Society", raised: '£15,800', category: 'Children' },
]

export default function CharitySection() {
  return (
    <section id="charity" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-brand-500/30 text-brand-400 text-sm font-medium mb-6">
              <Heart className="w-4 h-4" fill="currentColor" />
              Impact-First Design
            </div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Every subscription funds a cause you believe in
            </h2>
            <p className="text-white/50 text-lg mb-6 leading-relaxed">
              At least 10% of your subscription goes directly to your chosen charity — every single month.
              You choose your charity at signup and can change it anytime. You can also make independent
              donations directly through the platform.
            </p>
            <p className="text-white/40 text-base mb-8">
              Golf is the mechanism. Giving is the mission.
            </p>
            <Link href="/signup">
              <Button size="lg">
                Choose Your Charity
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <p className="text-sm text-white/40 font-medium uppercase tracking-wider mb-4">
              Featured Charities
            </p>
            {charities.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass glass-hover rounded-xl p-4 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{c.name}</p>
                    <p className="text-xs text-white/40">{c.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-400">{c.raised}</p>
                  <p className="text-xs text-white/30">raised</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
