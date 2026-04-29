import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function getActiveSubscription(supabase: any, userId: string) {
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single()
  return data?.status === 'active'
}

async function getUserScores(supabase: any, userId: string) {
  const { data } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  return data || []
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isActive = await getActiveSubscription(supabase, user.id)
  if (!isActive) return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })

  const { score, date } = await req.json()

  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
  }

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 })
  }

  // Check for duplicate date
  const { data: existing } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', date)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A score already exists for this date. Edit the existing one instead.' }, { status: 400 })
  }

  // Rolling 5 — if already at 5, delete oldest
  const currentScores = await getUserScores(supabase, user.id)
  if (currentScores.length >= 5) {
    const oldest = currentScores[currentScores.length - 1]
    await supabase.from('scores').delete().eq('id', oldest.id)
  }

  const { error } = await supabase.from('scores').insert({ user_id: user.id, score, date })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const scores = await getUserScores(supabase, user.id)
  return NextResponse.json({ scores })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isActive = await getActiveSubscription(supabase, user.id)
  if (!isActive) return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })

  const { id, score } = await req.json()
  if (!score || score < 1 || score > 45) {
    return NextResponse.json({ error: 'Score must be between 1 and 45' }, { status: 400 })
  }

  const { error } = await supabase
    .from('scores')
    .update({ score })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const scores = await getUserScores(supabase, user.id)
  return NextResponse.json({ scores })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const { error } = await supabase
    .from('scores')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const scores = await getUserScores(supabase, user.id)
  return NextResponse.json({ scores })
}
