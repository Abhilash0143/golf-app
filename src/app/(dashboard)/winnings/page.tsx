export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { Trophy, Upload } from 'lucide-react'
import WinnerUpload from '@/components/dashboard/WinnerUpload'

export default async function WinningsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*, draws(month, year), draw_results(prize_per_winner, match_type)')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  const totalPaid = (verifications || [])
    .filter((v: any) => v.payout_status === 'paid')
    .reduce((sum: number, v: any) => sum + (v.draw_results?.prize_per_winner || 0), 0)

  const statusVariant: Record<string, any> = {
    pending_submission: 'warning',
    submitted: 'info',
    approved: 'success',
    rejected: 'danger',
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">My Winnings</h1>
        <p className="text-white/40 mt-1">Track your prize history and upload verification</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-400/20 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Total Won</p>
            <p className="text-xl font-bold text-white mt-0.5">{formatCurrency(totalPaid / 100)}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Total Wins</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {(verifications || []).filter((v: any) => v.status === 'approved').length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Pending Review</p>
            <p className="text-xl font-bold text-white mt-0.5">
              {(verifications || []).filter((v: any) => v.status === 'submitted').length}
            </p>
          </div>
        </Card>
      </div>

      {!verifications || verifications.length === 0 ? (
        <Card className="text-center py-16">
          <Trophy className="w-16 h-16 text-white/10 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/40 mb-2">No wins yet</h3>
          <p className="text-white/25 text-sm">Enter your scores and participate in monthly draws to win prizes</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {verifications.map((v: any) => (
            <Card key={v.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-400/20 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-accent-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {v.draw_results?.match_type}-Number Match
                    </p>
                    <p className="text-sm text-white/40">
                      {v.draws ? `${getMonthName(v.draws.month)} ${v.draws.year}` : ''}
                    </p>
                    <p className="text-lg font-bold text-accent-400 mt-1">
                      {v.draw_results ? formatCurrency(v.draw_results.prize_per_winner / 100) : '—'}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Badge variant={statusVariant[v.status] || 'neutral'}>
                    {v.status.replace('_', ' ')}
                  </Badge>
                  <div>
                    <Badge variant={v.payout_status === 'paid' ? 'success' : 'neutral'}>
                      {v.payout_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {v.status === 'pending_submission' && (
                <WinnerUpload verificationId={v.id} drawId={v.draw_id} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
