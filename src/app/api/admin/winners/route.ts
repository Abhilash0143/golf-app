import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data } = await createAdminClient()
    .from('winner_verifications')
    .select('*, users(name, email), draws(month, year), draw_results(prize_per_winner, match_type)')
    .order('submitted_at', { ascending: false })

  return NextResponse.json({ verifications: data || [] })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id, action } = await req.json()
  const admin = createAdminClient()

  if (action === 'approve') {
    await admin.from('winner_verifications').update({ status: 'approved' }).eq('id', id)
  } else if (action === 'reject') {
    await admin.from('winner_verifications').update({ status: 'rejected' }).eq('id', id)
  } else if (action === 'mark_paid') {
    await admin.from('winner_verifications').update({ payout_status: 'paid', reviewed_at: new Date().toISOString() }).eq('id', id)
  }

  return NextResponse.json({ success: true })
}
