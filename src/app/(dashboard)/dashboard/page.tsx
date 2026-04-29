export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Target, Heart, Trophy, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, subscriptionRes, scoresRes, winsRes] = await Promise.all([
    supabase.from('users').select('*, charities(name)').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('winner_verifications').select('*, draws(month, year), draw_results(prize_per_winner, match_type)').eq('user_id', user.id).eq('payout_status', 'paid'),
  ])

  const profile = profileRes.data
  const subscription = subscriptionRes.data
  const scores = scoresRes.data || []
  const wins = winsRes.data || []

  const totalWon = wins.reduce((sum: number, w: any) => sum + (w.draw_results?.prize_per_winner || 0), 0)

  const statusVariant = subscription?.status === 'active' ? 'success' : subscription?.status === 'lapsed' ? 'warning' : 'danger'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {profile?.name?.split(' ')[0] || 'Member'}
        </h1>
        <p className="text-white/40 mt-1">Here&apos;s your platform overview</p>
      </div>

      {subscription?.status !== 'active' && (
        <div className="glass rounded-2xl p-5 border border-red-500/30 bg-red-500/5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-400">Subscription {subscription?.status || 'inactive'}</p>
            <p className="text-sm text-white/50 mt-0.5">Renew to access score entry and draws</p>
          </div>
          <Link href="/api/subscriptions/checkout">
            <Button variant="danger" size="sm">Renew Now</Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card glow className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Subscription</p>
            <Badge variant={statusVariant} className="mt-1">
              {subscription?.status || 'No subscription'}
            </Badge>
          </div>
        </Card>

        <Card glow className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Scores Entered</p>
            <p className="text-xl font-bold text-white mt-0.5">{scores.length} / 5</p>
          </div>
        </Card>

        <Card glow className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Total Won</p>
            <p className="text-xl font-bold text-white mt-0.5">{formatCurrency(totalWon / 100)}</p>
          </div>
        </Card>

        <Card glow className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-400/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wide">Charity</p>
            <p className="text-sm font-semibold text-white mt-0.5 truncate max-w-[120px]">
              {(profile as any)?.charities?.name || 'Not selected'}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Scores */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">My Scores</h2>
            <Link href="/scores" className="text-sm text-brand-400 hover:text-brand-300">
              Manage →
            </Link>
          </div>
          {scores.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No scores entered yet</p>
              <Link href="/scores" className="mt-3 inline-block">
                <Button size="sm" className="mt-3">Enter a Score</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">{s.score}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Score: {s.score}</p>
                      <p className="text-xs text-white/40">{formatDate(s.date)}</p>
                    </div>
                  </div>
                  <Badge variant="neutral">Stableford</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Subscription Details */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Subscription</h2>
          </div>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Plan</span>
                <span className="text-white text-sm font-medium capitalize">{subscription.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Status</span>
                <Badge variant={statusVariant}>{subscription.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Renewal</span>
                <span className="text-white text-sm font-medium">
                  {subscription.renewal_date ? formatDate(subscription.renewal_date) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Charity contribution</span>
                <span className="text-brand-400 text-sm font-medium">{profile?.contribution_pct || 10}%</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm mb-3">No active subscription</p>
              <Link href="/signup">
                <Button size="sm">Subscribe Now</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
