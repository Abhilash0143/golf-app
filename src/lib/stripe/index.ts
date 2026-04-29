import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
    amount: 1000, // £10.00 in pence
    label: 'Monthly',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
    amount: 10000, // £100.00 in pence
    label: 'Yearly',
    interval: 'year' as const,
  },
}

export const POOL_PERCENTAGE = 0.5 // 50% of subscription goes to prize pool
export const CHARITY_MIN_PERCENTAGE = 10 // minimum 10%
