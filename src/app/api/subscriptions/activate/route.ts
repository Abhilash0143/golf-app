import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId, plan, charityId } = await req.json()
  if (!userId || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = createAdminClient()

  const renewalDate = new Date()
  if (plan === 'yearly') {
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)
  } else {
    renewalDate.setMonth(renewalDate.getMonth() + 1)
  }

  const planAmount = plan === 'yearly' ? 10000 : 1000 // pence
  const charityAmount = Math.floor(planAmount * 0.1) // 10% minimum

  // Activate subscription
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan,
    status: 'active',
    stripe_id: `demo_${userId}`,
    stripe_customer_id: `demo_customer_${userId}`,
    renewal_date: renewalDate.toISOString(),
  }, { onConflict: 'user_id' })

  // Save charity selection and contribution %
  if (charityId) {
    await supabase.from('users').update({
      charity_id: charityId,
      contribution_pct: 10,
    }).eq('id', userId)

    // Record initial charity contribution
    await supabase.from('charity_contributions').insert({
      user_id: userId,
      charity_id: charityId,
      amount: charityAmount,
      date: new Date().toISOString().split('T')[0],
    })
  }

  return NextResponse.json({ success: true })
}
