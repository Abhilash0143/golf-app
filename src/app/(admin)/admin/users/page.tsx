export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminUsersClient from '@/components/admin/AdminUsersClient'

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

  return <AdminUsersClient initialUsers={users || []} />
}
