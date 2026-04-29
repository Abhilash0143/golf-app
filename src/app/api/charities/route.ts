import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const search = req.nextUrl.searchParams.get('search') || ''

  let query = supabase.from('charities').select('*').eq('active', true).order('featured', { ascending: false })
  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ charities: data })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { charityId, contributionPct } = await req.json()

  if (contributionPct !== undefined && contributionPct < 10) {
    return NextResponse.json({ error: 'Minimum contribution is 10%' }, { status: 400 })
  }

  const updates: Record<string, any> = {}
  if (charityId !== undefined) updates.charity_id = charityId
  if (contributionPct !== undefined) updates.contribution_pct = contributionPct

  const { error } = await supabase.from('users').update(updates).eq('id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
