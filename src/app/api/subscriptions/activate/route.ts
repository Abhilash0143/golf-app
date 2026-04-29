import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId, plan } = await req.json()
  if (!userId || !plan) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = createAdminClient()

  const renewalDate = new Date()
  plan === 'yearly'
    ? renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    : renewalDate.setMonth(renewalDate.getMonth() + 1)

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan,
    status: 'active',
    stripe_id: `demo_${userId}`,
    stripe_customer_id: `demo_customer_${userId}`,
    renewal_date: renewalDate.toISOString(),
  }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
