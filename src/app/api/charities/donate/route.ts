import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { charityId, amount } = await req.json()
  if (!charityId || !amount || amount < 100) {
    return NextResponse.json({ error: 'Minimum donation is £1' }, { status: 400 })
  }

  const { error } = await supabase.from('charity_contributions').insert({
    user_id: user.id,
    charity_id: charityId,
    amount,
    date: new Date().toISOString().split('T')[0],
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
