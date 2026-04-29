'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Target, Plus, Trash2, Edit3, Info } from 'lucide-react'
import type { Score } from '@/types'

interface Props {
  initialScores: Score[]
  isActive: boolean
  userId: string // kept for future server actions
}

export default function ScoresClient({ initialScores, isActive, userId: _userId }: Props) {
  const [scores, setScores] = useState<Score[]>(initialScores)
  const [score, setScore] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editScore, setEditScore] = useState('')

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const num = parseInt(score)
    if (isNaN(num) || num < 1 || num > 45) {
      setError('Score must be between 1 and 45')
      return
    }

    setLoading(true)
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: num, date }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Failed to add score')
    } else {
      setScores(data.scores)
      setScore('')
    }
    setLoading(false)
  }

  async function deleteScore(id: string) {
    const res = await fetch(`/api/scores?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      const data = await res.json()
      setScores(data.scores)
    }
  }

  async function saveEdit(id: string) {
    const num = parseInt(editScore)
    if (isNaN(num) || num < 1 || num > 45) {
      setError('Score must be between 1 and 45')
      return
    }
    const res = await fetch(`/api/scores`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, score: num }),
    })
    if (res.ok) {
      const data = await res.json()
      setScores(data.scores)
      setEditId(null)
      setEditScore('')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Scores</h1>
        <p className="text-white/40 mt-1">Your scores act as lottery numbers in the monthly draw</p>
      </div>

      {!isActive && (
        <div className="glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5">
          <p className="text-red-400 font-semibold">Active subscription required</p>
          <p className="text-sm text-white/50 mt-1">Renew your subscription to enter and edit scores.</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add Score Form */}
        <Card className="lg:col-span-1">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-400" />
            Add Score
          </h2>

          <form onSubmit={addScore} className="space-y-4">
            <Input
              id="score"
              label="Stableford Score (1–45)"
              type="number"
              min={1}
              max={45}
              placeholder="e.g. 32"
              value={score}
              onChange={e => setScore(e.target.value)}
              required
              disabled={!isActive}
            />
            <Input
              id="date"
              label="Date Played"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              disabled={!isActive}
            />

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full" disabled={!isActive}>
              Add Score
            </Button>
          </form>

          <div className="mt-5 glass rounded-xl p-4 flex gap-3">
            <Info className="w-4 h-4 text-white/30 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-white/40 leading-relaxed">
              You can enter up to 5 scores. Adding a 6th automatically removes your oldest entry.
              One score per date — edit existing to change it.
            </p>
          </div>
        </Card>

        {/* Scores List */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Your Draw Numbers
            </h2>
            <Badge variant={scores.length === 5 ? 'success' : 'neutral'}>
              {scores.length} / 5
            </Badge>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/40">No scores yet — add your first Stableford score</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-black text-brand-400">{s.score}</span>
                  </div>
                  <div className="flex-1">
                    {editId === s.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={45}
                          value={editScore}
                          onChange={e => setEditScore(e.target.value)}
                          className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <Button size="sm" onClick={() => saveEdit(s.id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-white">Score: {s.score}</p>
                        <p className="text-xs text-white/40">{formatDate(s.date)}</p>
                      </>
                    )}
                  </div>
                  {editId !== s.id && isActive && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditId(s.id); setEditScore(String(s.score)) }}
                        className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteScore(s.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
