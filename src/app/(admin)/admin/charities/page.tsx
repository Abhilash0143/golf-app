export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminCharitiesClient from '@/components/admin/AdminCharitiesClient'

export default async function AdminCharitiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile.data?.role !== 'admin') redirect('/dashboard')

  const { data: charities } = await supabase.from('charities').select('*').order('featured', { ascending: false })

  return <AdminCharitiesClient initialCharities={charities || []} />
}
