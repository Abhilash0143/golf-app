'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { Trophy, ExternalLink, Check, X, DollarSign } from 'lucide-react'

interface Props {
  initialVerifications: any[]
}

const statusVariant: Record<string, any> = {
  pending_submission: 'warning',
  submitted: 'info',
  approved: 'success',
  rejected: 'danger',
}

export default function AdminWinnersClient({ initialVerifications }: Props) {
  const [verifications, setVerifications] = useState(initialVerifications)
  const [loading, setLoading] = useState<string | null>(null)

  async function act(id: string, action: string) {
    setLoading(id + action)
    await fetch('/api/admin/winners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    setVerifications(prev => prev.map(v => {
      if (v.id !== id) return v
      if (action === 'approve') return { ...v, status: 'approved' }
      if (action === 'reject') return { ...v, status: 'rejected' }
      if (action === 'mark_paid') return { ...v, payout_status: 'paid' }
      return v
    }))
    setLoading(null)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Winner Verification</h1>
        <p className="text-white/40 mt-1">Review proof submissions and manage payouts</p>
      </div>

      <div className="space-y-4">
        {verifications.map((v: any) => (
          <Card key={v.id}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-400/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-accent-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{v.users?.name || 'Unknown'}</p>
                  <p className="text-xs text-white/40">{v.users?.email}</p>
                  <p className="text-sm text-white/60 mt-1">
                    {v.draws ? `${getMonthName(v.draws.month)} ${v.draws.year}` : ''}
                    {v.draw_results && ` — ${v.draw_results.match_type}-match`}
                    {v.draw_results?.prize_per_winner && ` — ${formatCurrency(v.draw_results.prize_per_winner / 100)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={statusVariant[v.status]}>{v.status.replace('_', ' ')}</Badge>
                <Badge variant={v.payout_status === 'paid' ? 'success' : 'neutral'}>{v.payout_status}</Badge>
              </div>
            </div>

            {v.proof_url && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <a
                  href={v.proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Proof Screenshot
                </a>
              </div>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              {v.status === 'submitted' && (
                <>
                  <Button size="sm" onClick={() => act(v.id, 'approve')} loading={loading === v.id + 'approve'}>
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    Approve
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => act(v.id, 'reject')} loading={loading === v.id + 'reject'}>
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Reject
                  </Button>
                </>
              )}
              {v.status === 'approved' && v.payout_status === 'pending' && (
                <Button size="sm" variant="secondary" onClick={() => act(v.id, 'mark_paid')} loading={loading === v.id + 'mark_paid'}>
                  <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </Card>
        ))}

        {verifications.length === 0 && (
          <Card className="text-center py-16">
            <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40">No winner verifications yet</p>
          </Card>
        )}
      </div>
    </div>
  )
}
