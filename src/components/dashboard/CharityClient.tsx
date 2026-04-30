'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Heart, Search, Check, Sliders, Gift, ExternalLink } from 'lucide-react'
import type { Charity } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface Props {
  initialCharities: Charity[]
  currentCharityId: string | null | undefined
  currentPct: number
}

export default function CharityClient({ initialCharities, currentCharityId, currentPct }: Props) {
  const [charities] = useState<Charity[]>(initialCharities)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(currentCharityId || null)
  const [pct, setPct] = useState(currentPct)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Independent donation state
  const [donateCharityId, setDonateCharityId] = useState<string | null>(null)
  const [donateAmount, setDonateAmount] = useState('')
  const [donating, setDonating] = useState(false)
  const [donated, setDonated] = useState(false)

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  async function save() {
    if (pct < 10) return
    setSaving(true)
    await fetch('/api/charities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId: selectedId, contributionPct: pct }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function donate() {
    const amount = parseFloat(donateAmount)
    if (!donateCharityId || isNaN(amount) || amount < 1) return
    setDonating(true)
    await fetch('/api/charities/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ charityId: donateCharityId, amount: Math.round(amount * 100) }),
    })
    setDonating(false)
    setDonated(true)
    setDonateAmount('')
    setTimeout(() => setDonated(false), 3000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Charity</h1>
        <p className="text-white/40 mt-1">Choose who benefits from your subscription</p>
      </div>

      {/* Contribution slider */}
      <Card glow>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Monthly Contribution Percentage</h2>
            <p className="text-xs text-white/40">Minimum 10% of your subscription goes to charity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min={10} max={100} value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="flex-1 accent-brand-500" />
          <div className="w-16 text-center">
            <span className="text-2xl font-bold text-brand-400">{pct}%</span>
          </div>
        </div>
      </Card>

      {/* Independent Donation */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-accent-400/20 flex items-center justify-center">
            <Gift className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Make a One-Off Donation</h2>
            <p className="text-xs text-white/40">Independent of your subscription — donate directly to any charity</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Select Charity</label>
            <select
              value={donateCharityId || ''}
              onChange={e => setDonateCharityId(e.target.value || null)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            >
              <option value="">Choose a charity...</option>
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Amount (£)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                step={0.01}
                placeholder="e.g. 25.00"
                value={donateAmount}
                onChange={e => setDonateAmount(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
              <Button size="sm" onClick={donate} loading={donating}
                disabled={!donateCharityId || !donateAmount}
                className="whitespace-nowrap">
                {donated ? '✓ Done!' : 'Donate'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input type="text" placeholder="Search charities..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>

      {/* Charity grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((charity) => {
          const isSelected = selectedId === charity.id
          return (
            <button key={charity.id} onClick={() => setSelectedId(charity.id)}
              className={cn(
                'text-left rounded-2xl p-5 border transition-all duration-200',
                isSelected ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30' : 'border-white/10 bg-white/5 hover:border-white/20'
              )}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{charity.name}</p>
                    {charity.featured && <Badge variant="success" className="mt-1">Featured</Badge>}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 mt-3 leading-relaxed line-clamp-2">{charity.description}</p>
              <Link href={`/charity/${charity.id}`}
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-3">
                <ExternalLink className="w-3 h-3" /> View Profile
              </Link>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} loading={saving} size="lg">
          {saved ? '✓ Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
