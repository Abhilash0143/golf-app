export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { Users } from 'lucide-react'

export default async function AdminUsersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const { data: users } = await supabase
    .from('users')
    .select('*, subscriptions(plan, status, renewal_date), charities(name)')
    .order('created_at', { ascending: false })

  const subVariant: Record<string, any> = { active: 'success', lapsed: 'warning', cancelled: 'danger' }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/40 mt-1">{users?.length || 0} registered users</p>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-4 text-white/40 font-medium">User</th>
                <th className="text-left px-6 py-4 text-white/40 font-medium">Plan</th>
                <th className="text-left px-6 py-4 text-white/40 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-white/40 font-medium">Charity</th>
                <th className="text-left px-6 py-4 text-white/40 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u: any) => {
                const sub = u.subscriptions?.[0] || u.subscriptions
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{u.name || '—'}</p>
                      <p className="text-white/40 text-xs">{u.email}</p>
                    </td>
                    <td className="px-6 py-4 capitalize text-white/70">{sub?.plan || '—'}</td>
                    <td className="px-6 py-4">
                      <Badge variant={subVariant[sub?.status] || 'neutral'}>
                        {sub?.status || 'no subscription'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-white/70 text-xs">{u.charities?.name || '—'}</td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {u.created_at ? formatDate(u.created_at) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
