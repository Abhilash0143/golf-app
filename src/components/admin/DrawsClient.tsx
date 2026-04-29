'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { Dices, Play, Send, RotateCcw, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  initialDraws: any[]
}

const statusVariant: Record<string, any> = {
  draft: 'neutral',
  simulated: 'info',
  published: 'success',
}

const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }))

export default function DrawsClient({ initialDraws }: Props) {
  const [draws, setDraws] = useState(initialDraws)
  const [creating, setCreating] = useState(false)
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1)
  const [newYear, setNewYear] = useState(new Date().getFullYear())
  const [newLogic, setNewLogic] = useState<'random' | 'algorithmic'>('random')
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function createDraw() {
    setLoading('create')
    const res = await fetch('/api/admin/draws', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month: newMonth, year: newYear, logic: newLogic }),
    })
    const data = await res.json()
    if (data.draw) setDraws(prev => [data.draw, ...prev])
    setCreating(false)
    setLoading(null)
    router.refresh()
  }

  async function runAction(drawId: string, action: string) {
    setLoading(drawId + action)
    const res = await fetch('/api/admin/draws', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, drawId }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Draw Management</h1>
          <p className="text-white/40 mt-1">Configure, simulate, and publish monthly draws</p>
        </div>
        <Button onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          New Draw
        </Button>
      </div>

      {creating && (
        <Card>
          <h2 className="font-semibold text-white mb-4">Create New Draw</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Month</label>
              <select
                value={newMonth}
                onChange={e => setNewMonth(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Year</label>
              <input
                type="number"
                value={newYear}
                onChange={e => setNewYear(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Logic</label>
              <select
                value={newLogic}
                onChange={e => setNewLogic(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={createDraw} loading={loading === 'create'}>Create Draw</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {result && (
        <Card className="border border-brand-500/30 bg-brand-500/5">
          <h3 className="font-semibold text-white mb-2">Draw Result</h3>
          <p className="text-sm text-white/60">Drawn numbers: <span className="text-brand-400 font-bold">{result.drawnNumbers?.join(', ')}</span></p>
          {result.results?.map((r: any) => (
            <p key={r.match_type} className="text-sm text-white/50 mt-1">
              {r.match_type}-match: {r.winner_ids?.length || 0} winner(s) — {formatCurrency(r.prize_per_winner / 100)} each
            </p>
          ))}
          <Button variant="ghost" size="sm" className="mt-3" onClick={() => setResult(null)}>Dismiss</Button>
        </Card>
      )}

      <div className="space-y-4">
        {draws.map((draw: any) => (
          <Card key={draw.id}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Dices className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{getMonthName(draw.month)} {draw.year}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={statusVariant[draw.status]}>{draw.status}</Badge>
                    <span className="text-xs text-white/40 capitalize">{draw.logic}</span>
                  </div>
                  {draw.prize_pools?.[0] && (
                    <p className="text-xs text-white/40 mt-1">
                      Pool: {formatCurrency(draw.prize_pools[0].total_amount / 100)}
                      {draw.jackpot_rollover_amount > 0 && ` (+${formatCurrency(draw.jackpot_rollover_amount / 100)} rollover)`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {draw.status === 'draft' && (
                  <Button size="sm" variant="secondary" onClick={() => runAction(draw.id, 'simulate')} loading={loading === draw.id + 'simulate'}>
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Simulate
                  </Button>
                )}
                {(draw.status === 'draft' || draw.status === 'simulated') && (
                  <Button size="sm" onClick={() => runAction(draw.id, 'publish')} loading={loading === draw.id + 'publish'}>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Publish
                  </Button>
                )}
                {draw.status === 'published' && (
                  <Button size="sm" variant="danger" onClick={() => runAction(draw.id, 'unpublish')} loading={loading === draw.id + 'unpublish'}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Unpublish
                  </Button>
                )}
              </div>
            </div>

            {draw.draw_results?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 grid sm:grid-cols-3 gap-3">
                {draw.draw_results.map((r: any) => (
                  <div key={r.id} className="glass rounded-xl p-3">
                    <p className="text-xs text-white/40">{r.match_type}-match</p>
                    <p className="font-bold text-white">{r.winner_ids?.length || 0} winner(s)</p>
                    <p className="text-xs text-brand-400">{r.prize_per_winner ? formatCurrency(r.prize_per_winner / 100) + ' each' : '—'}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {draws.length === 0 && (
          <Card className="text-center py-16">
            <Dices className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No draws yet. Create your first draw to get started.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
