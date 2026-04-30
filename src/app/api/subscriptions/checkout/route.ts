import { createClient } from '@/lib/supabase/server'
import { getStripe, PLANS } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const planConfig = PLANS[plan as 'monthly' | 'yearly']
  if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Bypass Stripe when key is not configured (demo / assessment mode)
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey.startsWith('your_')) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, plan }),
    })
    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true` })
  }

  const stripe = getStripe()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard?subscribed=true`,
    cancel_url: `${appUrl}/signup`,
    customer_email: user.email,
    metadata: { userId: user.id, plan },
    subscription_data: {
      metadata: { userId: user.id, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const plan = req.nextUrl.searchParams.get('plan') || 'monthly'

  // Bypass Stripe — activate directly and redirect
  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey || stripeKey.startsWith('your_')) {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/subscriptions/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, plan }),
    })
    return NextResponse.redirect(new URL('/dashboard?subscribed=true', req.url))
  }

  return NextResponse.redirect(new URL('/dashboard', req.url))
}
