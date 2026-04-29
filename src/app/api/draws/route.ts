import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: draws } = await supabase
    .from('draws')
    .select('*, draw_results(*), prize_pools(*)')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(6)

  return NextResponse.json({ draws: draws || [] })
}
