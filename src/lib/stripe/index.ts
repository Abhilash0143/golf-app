import Stripe from 'stripe'

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('your_')) {
    throw new Error('Stripe not configured')
  }
  return new Stripe(key)
}

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1000,
    label: 'Monthly',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 10000,
    label: 'Yearly',
    interval: 'year' as const,
  },
}

export const POOL_PERCENTAGE = 0.5
export const CHARITY_MIN_PERCENTAGE = 10
