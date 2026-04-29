'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Heart, Search, Check, Sliders } from 'lucide-react'
import type { Charity } from '@/types'
import { cn } from '@/lib/utils'

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
            <h2 className="font-semibold text-white">Contribution Percentage</h2>
            <p className="text-xs text-white/40">Minimum 10% of your subscription goes to charity</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min={10}
            max={100}
            value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
          <div className="w-16 text-center">
            <span className="text-2xl font-bold text-brand-400">{pct}%</span>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search charities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Charity grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map((charity) => {
          const isSelected = selectedId === charity.id
          return (
            <button
              key={charity.id}
              onClick={() => setSelectedId(charity.id)}
              className={cn(
                'text-left rounded-2xl p-5 border transition-all duration-200',
                isSelected
                  ? 'border-brand-500 bg-brand-500/10 ring-1 ring-brand-500/30'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{charity.name}</p>
                    {charity.featured && (
                      <Badge variant="success" className="mt-1">Featured</Badge>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-white/40 mt-3 leading-relaxed line-clamp-2">
                {charity.description}
              </p>
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
