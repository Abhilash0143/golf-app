export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CharityClient from '@/components/dashboard/CharityClient'

export default async function CharityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profileRes, charitiesRes] = await Promise.all([
    supabase.from('users').select('charity_id, contribution_pct').eq('id', user.id).single(),
    supabase.from('charities').select('*').eq('active', true).order('featured', { ascending: false }),
  ])

  return (
    <CharityClient
      initialCharities={charitiesRes.data || []}
      currentCharityId={profileRes.data?.charity_id}
      currentPct={profileRes.data?.contribution_pct ?? 10}
    />
  )
}
