export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import { Users, Dices, Heart, Trophy, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const [usersRes, subsRes, drawsRes, winnersRes] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('subscriptions').select('status, plan'),
    supabase.from('draws').select('status').eq('status', 'published'),
    supabase.from('winner_verifications').select('payout_status, draw_results(prize_per_winner)'),
  ])

  const activeSubscribers = (subsRes.data || []).filter((s: any) => s.status === 'active').length
  const monthlyRevenue = (subsRes.data || []).reduce((sum: number, s: any) => {
    if (s.status !== 'active') return sum
    return sum + (s.plan === 'monthly' ? 1000 : Math.round(10000 / 12))
  }, 0)

  const totalPaidOut = (winnersRes.data || [])
    .filter((v: any) => v.payout_status === 'paid')
    .reduce((sum: number, v: any) => sum + (v.draw_results?.prize_per_winner || 0), 0)

  const stats = [
    { label: 'Total Users', value: String(usersRes.count || 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Active Subscribers', value: String(activeSubscribers), icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
    { label: 'Draws Published', value: String((drawsRes.data || []).length), icon: Dices, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Total Paid Out', value: formatCurrency(totalPaidOut / 100), icon: Trophy, color: 'text-accent-400', bg: 'bg-accent-400/10' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
        <p className="text-white/40 mt-1">Platform summary at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} glow className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold text-white mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-white mb-2">Monthly Revenue</h2>
          <p className="text-3xl font-black text-brand-400">{formatCurrency(monthlyRevenue / 100)}</p>
          <p className="text-sm text-white/40 mt-1">From {activeSubscribers} active subscriptions</p>
        </Card>
        <Card>
          <h2 className="font-semibold text-white mb-2">Next Draw</h2>
          <p className="text-white/40 text-sm">Go to Draw Management to run or simulate the next monthly draw.</p>
        </Card>
      </div>
    </div>
  )
}
