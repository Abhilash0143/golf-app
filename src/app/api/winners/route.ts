import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('winner_verifications')
    .select('*, draws(month, year), draw_results(prize_per_winner, match_type)')
    .eq('user_id', user.id)
    .order('submitted_at', { ascending: false })

  return NextResponse.json({ verifications: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { drawId, proofUrl } = await req.json()
  if (!drawId || !proofUrl) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { error } = await supabase.from('winner_verifications').upsert({
    user_id: user.id,
    draw_id: drawId,
    proof_url: proofUrl,
    status: 'submitted',
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'user_id,draw_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
