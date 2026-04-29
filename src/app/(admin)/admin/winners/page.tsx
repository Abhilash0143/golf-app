export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminWinnersClient from '@/components/admin/AdminWinnersClient'

export default async function AdminWinnersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const { data: verifications } = await supabase
    .from('winner_verifications')
    .select('*, users(name, email), draws(month, year), draw_results(prize_per_winner, match_type)')
    .order('submitted_at', { ascending: false })

  return <AdminWinnersClient initialVerifications={verifications || []} />
}
