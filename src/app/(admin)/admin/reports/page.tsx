export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { BarChart3, Users, Trophy, Heart, TrendingUp } from 'lucide-react'

export default async function AdminReportsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const [subsRes, drawsRes, verRes, charitiesRes] = await Promise.all([
    supabase.from('subscriptions').select('plan, status'),
    supabase.from('draws').select('month, year, status, prize_pools(total_amount)').eq('status', 'published').order('year', { ascending: false }).order('month', { ascending: false }).limit(6),
    supabase.from('winner_verifications').select('payout_status, draw_results(prize_per_winner)'),
    supabase.from('charity_contributions').select('charity_id, amount, charities(name)'),
  ])

  const subs = subsRes.data || []
  const active = subs.filter(s => s.status === 'active')
  const monthly = active.filter(s => s.plan === 'monthly').length
  const yearly = active.filter(s => s.plan === 'yearly').length
  const totalRevenue = monthly * 1000 + yearly * 10000

  const totalPaidOut = (verRes.data || [])
    .filter(v => v.payout_status === 'paid')
    .reduce((sum: number, v: any) => sum + (v.draw_results?.prize_per_winner || 0), 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-white/40 mt-1">Platform performance overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Subscriptions</h3>
          </div>
          <p className="text-3xl font-black text-white">{active.length}</p>
          <p className="text-sm text-white/40 mt-1">Active subscribers</p>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Monthly</span>
              <span className="text-white">{monthly}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Yearly</span>
              <span className="text-white">{yearly}</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-brand-400" />
            <h3 className="font-semibold text-white">Revenue</h3>
          </div>
          <p className="text-3xl font-black text-brand-400">{formatCurrency(totalRevenue / 100)}</p>
          <p className="text-sm text-white/40 mt-1">Current period (est.)</p>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="w-5 h-5 text-accent-400" />
            <h3 className="font-semibold text-white">Total Paid Out</h3>
          </div>
          <p className="text-3xl font-black text-accent-400">{formatCurrency(totalPaidOut / 100)}</p>
          <p className="text-sm text-white/40 mt-1">To winners</p>
        </Card>
      </div>

      {/* Draw history */}
      <Card>
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Recent Draws
        </h2>
        {(drawsRes.data || []).length === 0 ? (
          <p className="text-white/40 text-sm">No published draws yet</p>
        ) : (
          <div className="space-y-3">
            {(drawsRes.data || []).map((draw: any) => (
              <div key={draw.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/70">{getMonthName(draw.month)} {draw.year}</span>
                <span className="text-white font-semibold">
                  {draw.prize_pools?.[0]?.total_amount
                    ? formatCurrency(draw.prize_pools[0].total_amount / 100)
                    : '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
