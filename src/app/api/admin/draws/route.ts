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

  const { data } = await supabase
    .from('draws')
    .select('*, prize_pools(*), draw_results(*)')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return NextResponse.json({ draws: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { month, year, logic } = await req.json()
  const admin = createAdminClient()

  const { data: draw, error } = await admin.from('draws').insert({
    month, year, status: 'draft', logic: logic || 'random', jackpot_rollover_amount: 0,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ draw })
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !(await isAdmin(supabase, user.id))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { action, drawId } = await req.json()
  const admin = createAdminClient()

  if (action === 'simulate' || action === 'publish') {
    // Calculate prize pool from active subscriptions
    const { data: subs } = await admin.from('subscriptions').select('plan').eq('status', 'active')
    const totalPool = (subs || []).reduce((sum: number, s: any) => {
      return sum + (s.plan === 'monthly' ? 500 : 5000) // 50% of £10 or £100 in pence
    }, 0)

    const { data: draw } = await admin.from('draws').select('jackpot_rollover_amount').eq('id', drawId).single()
    const rollover = draw?.jackpot_rollover_amount || 0

    const jackpot = Math.floor(totalPool * 0.4) + rollover
    const tier4 = Math.floor(totalPool * 0.35)
    const tier3 = Math.floor(totalPool * 0.25)

    await admin.from('prize_pools').upsert({
      draw_id: drawId, total_amount: totalPool,
      tier_40: jackpot, tier_35: tier4, tier_25: tier3,
    }, { onConflict: 'draw_id' })

    // Get all active users' scores for matching
    const { data: drawData } = await admin.from('draws').select('logic').eq('id', drawId).single()

    // Draw 5 numbers (1-45)
    const drawnNumbers: number[] = []
    if (drawData?.logic === 'random') {
      while (drawnNumbers.length < 5) {
        const n = Math.floor(Math.random() * 45) + 1
        if (!drawnNumbers.includes(n)) drawnNumbers.push(n)
      }
    } else {
      // Algorithmic: use least frequent scores
      const { data: allScores } = await admin.from('scores').select('score')
      const freq: Record<number, number> = {}
      ;(allScores || []).forEach((s: any) => { freq[s.score] = (freq[s.score] || 0) + 1 })
      const sorted = Array.from({ length: 45 }, (_, i) => i + 1).sort((a, b) => (freq[a] || 0) - (freq[b] || 0))
      drawnNumbers.push(...sorted.slice(0, 5))
    }

    // Find winners by matching scores
    const { data: userScores } = await admin
      .from('scores')
      .select('user_id, score')

    const userScoreMap: Record<string, number[]> = {}
    ;(userScores || []).forEach((s: any) => {
      if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = []
      userScoreMap[s.user_id].push(s.score)
    })

    const fiveMatch: string[] = [], fourMatch: string[] = [], threeMatch: string[] = []
    for (const [uid, scores] of Object.entries(userScoreMap)) {
      const matches = scores.filter(s => drawnNumbers.includes(s)).length
      if (matches === 5) fiveMatch.push(uid)
      else if (matches === 4) fourMatch.push(uid)
      else if (matches === 3) threeMatch.push(uid)
    }

    // Handle jackpot rollover
    let nextRollover = 0
    if (fiveMatch.length === 0 && action === 'publish') {
      nextRollover = jackpot
    }

    const results = [
      { draw_id: drawId, match_type: '5', winner_ids: fiveMatch, prize_per_winner: fiveMatch.length ? Math.floor(jackpot / fiveMatch.length) : 0, total_pool_tier: jackpot },
      { draw_id: drawId, match_type: '4', winner_ids: fourMatch, prize_per_winner: fourMatch.length ? Math.floor(tier4 / fourMatch.length) : 0, total_pool_tier: tier4 },
      { draw_id: drawId, match_type: '3', winner_ids: threeMatch, prize_per_winner: threeMatch.length ? Math.floor(tier3 / threeMatch.length) : 0, total_pool_tier: tier3 },
    ]

    await admin.from('draw_results').delete().eq('draw_id', drawId)
    await admin.from('draw_results').insert(results)

    const newStatus = action === 'publish' ? 'published' : 'simulated'
    await admin.from('draws').update({ status: newStatus }).eq('id', drawId)

    if (action === 'publish') {
      // Create winner verification records
      const allWinners = [...fiveMatch, ...fourMatch, ...threeMatch]
      if (allWinners.length > 0) {
        await admin.from('winner_verifications').upsert(
          allWinners.map(uid => ({
            user_id: uid, draw_id: drawId, status: 'pending_submission',
            payout_status: 'pending',
          })),
          { onConflict: 'user_id,draw_id' }
        )
      }

      // Handle jackpot rollover to next draw
      if (nextRollover > 0) {
        const nextMonth = new Date()
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        await admin.from('draws').update({ jackpot_rollover_amount: nextRollover })
          .gt('id', drawId).limit(1)
      }
    }

    return NextResponse.json({ success: true, drawnNumbers, results })
  }

  if (action === 'unpublish') {
    await createAdminClient().from('draws').update({ status: 'draft' }).eq('id', drawId)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
