import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase.from('users').select('role').eq('id', userId).single()
  return data?.role === 'admin'
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data } = await createAdminClient()
    .from('scores').select('*').eq('user_id', userId).order('date', { ascending: false })

  return NextResponse.json({ scores: data || [] })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { scoreId, score } = await req.json()
  if (!scoreId || !score || score < 1 || score > 45) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  const { error } = await createAdminClient().from('scores').update({ score }).eq('id', scoreId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const scoreId = req.nextUrl.searchParams.get('scoreId')
  if (!scoreId) return NextResponse.json({ error: 'scoreId required' }, { status: 400 })

  const { error } = await createAdminClient().from('scores').delete().eq('id', scoreId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
