import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPaymentFailedEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, plan } = session.metadata || {}
      if (!userId || !plan) break

      const subId = session.subscription as string
      const sub = await stripe.subscriptions.retrieve(subId) as any

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan,
        status: 'active',
        stripe_id: subId,
        stripe_customer_id: session.customer as string,
        renewal_date: new Date(sub.current_period_end * 1000).toISOString(),
      }, { onConflict: 'user_id' })

      await supabase.from('users').upsert({
        id: userId,
        email: session.customer_email,
        contribution_pct: 10,
      }, { onConflict: 'id' })
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as any
      const subId = invoice.subscription as string
      const sub = await stripe.subscriptions.retrieve(subId) as any
      const userId = sub.metadata?.userId
      if (!userId) break

      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          renewal_date: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_id', subId)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as any
      const subId = invoice.subscription as string
      const { data: subscription } = await supabase
        .from('subscriptions')
        .update({ status: 'lapsed' })
        .eq('stripe_id', subId)
        .select('user_id')
        .single()

      if (subscription) {
        const { data: user } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', (subscription as any).user_id)
          .single()
        if (user) await sendPaymentFailedEmail((user as any).email, (user as any).name)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('stripe_id', sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
