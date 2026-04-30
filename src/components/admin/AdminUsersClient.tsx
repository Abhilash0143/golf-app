'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Users, ChevronDown, ChevronUp, Target, Trash2, Edit3, Check, X } from 'lucide-react'

interface Props {
  initialUsers: any[]
}

const subVariant: Record<string, any> = { active: 'success', lapsed: 'warning', cancelled: 'danger' }

export default function AdminUsersClient({ initialUsers }: Props) {
  const [users] = useState(initialUsers)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [userScores, setUserScores] = useState<Record<string, any[]>>({})
  const [loadingScores, setLoadingScores] = useState<string | null>(null)
  const [editingScore, setEditingScore] = useState<string | null>(null)
  const [editVal, setEditVal] = useState('')

  async function loadScores(userId: string) {
    if (userScores[userId]) {
      setExpandedUser(expandedUser === userId ? null : userId)
      return
    }
    setLoadingScores(userId)
    const res = await fetch(`/api/admin/users/scores?userId=${userId}`)
    const data = await res.json()
    setUserScores(prev => ({ ...prev, [userId]: data.scores || [] }))
    setExpandedUser(userId)
    setLoadingScores(null)
  }

  async function deleteScore(userId: string, scoreId: string) {
    await fetch(`/api/admin/users/scores?scoreId=${scoreId}`, { method: 'DELETE' })
    setUserScores(prev => ({
      ...prev,
      [userId]: prev[userId].filter(s => s.id !== scoreId)
    }))
  }

  async function saveScore(userId: string, scoreId: string) {
    const val = parseInt(editVal)
    if (isNaN(val) || val < 1 || val > 45) return
    await fetch('/api/admin/users/scores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreId, score: val }),
    })
    setUserScores(prev => ({
      ...prev,
      [userId]: prev[userId].map(s => s.id === scoreId ? { ...s, score: val } : s)
    }))
    setEditingScore(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-400" />
          Users
        </h1>
        <p className="text-white/40 mt-1">{users.length} registered users</p>
      </div>

      <div className="space-y-3">
        {users.map((u: any) => {
          const sub = Array.isArray(u.subscriptions) ? u.subscriptions[0] : u.subscriptions
          const isExpanded = expandedUser === u.id
          const scores = userScores[u.id] || []

          return (
            <Card key={u.id} className="p-0 overflow-hidden">
              <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white/60">
                    {(u.name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{u.name || '—'}</p>
                    <p className="text-xs text-white/40">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-white/40 capitalize">{sub?.plan || '—'}</span>
                  <Badge variant={subVariant[sub?.status] || 'neutral'}>
                    {sub?.status || 'no subscription'}
                  </Badge>
                  <span className="text-xs text-white/40">{u.charities?.name || 'No charity'}</span>
                  <button
                    onClick={() => loadScores(u.id)}
                    disabled={loadingScores === u.id}
                    className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Scores
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-white/5 px-5 py-4 bg-white/2">
                  <p className="text-xs text-white/40 font-medium uppercase tracking-wide mb-3">
                    Golf Scores — Admin Edit
                  </p>
                  {scores.length === 0 ? (
                    <p className="text-sm text-white/30">No scores entered</p>
                  ) : (
                    <div className="space-y-2">
                      {scores.map((s: any) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 glass rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-brand-400">{s.score}</span>
                          </div>
                          <div className="flex-1">
                            {editingScore === s.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number" min={1} max={45}
                                  value={editVal}
                                  onChange={e => setEditVal(e.target.value)}
                                  className="w-20 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                                />
                                <button onClick={() => saveScore(u.id, s.id)}
                                  className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/30">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingScore(null)}
                                  className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-white">Score: {s.score} <span className="text-white/40 text-xs ml-2">{formatDate(s.date)}</span></p>
                            )}
                          </div>
                          {editingScore !== s.id && (
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingScore(s.id); setEditVal(String(s.score)) }}
                                className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteScore(u.id, s.id)}
                                className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
