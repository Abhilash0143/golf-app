export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DrawsClient from '@/components/admin/DrawsClient'

export default async function AdminDrawsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const { data: draws } = await supabase
    .from('draws')
    .select('*, prize_pools(*), draw_results(*)')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return <DrawsClient initialDraws={draws || []} />
}
