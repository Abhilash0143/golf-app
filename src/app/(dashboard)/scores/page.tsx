export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ScoresClient from '@/components/dashboard/ScoresClient'

export default async function ScoresPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const subRes = await supabase.from('subscriptions').select('status').eq('user_id', user.id).single()
  const isActive = subRes.data?.status === 'active'

  const scoresRes = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })

  return (
    <ScoresClient
      initialScores={scoresRes.data || []}
      isActive={isActive}
      userId={user.id}
    />
  )
}
