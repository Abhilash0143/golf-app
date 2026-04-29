export type Role = 'subscriber' | 'admin'
export type SubscriptionStatus = 'active' | 'lapsed' | 'cancelled'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type DrawStatus = 'draft' | 'simulated' | 'published'
export type DrawLogic = 'random' | 'algorithmic'
export type MatchType = '5' | '4' | '3'
export type VerificationStatus = 'pending_submission' | 'submitted' | 'approved' | 'rejected'
export type PayoutStatus = 'pending' | 'paid'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  charity_id: string | null
  contribution_pct: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  stripe_id: string
  stripe_customer_id: string
  renewal_date: string
  cancelled_at: string | null
}

export interface Score {
  id: string
  user_id: string
  score: number
  date: string
  created_at: string
}

export interface Charity {
  id: string
  name: string
  description: string
  images: string[]
  events: string[]
  featured: boolean
  active: boolean
}

export interface CharityContribution {
  id: string
  user_id: string
  charity_id: string
  amount: number
  date: string
}

export interface Draw {
  id: string
  month: number
  year: number
  status: DrawStatus
  logic: DrawLogic
  jackpot_rollover_amount: number
}

export interface DrawResult {
  id: string
  draw_id: string
  match_type: MatchType
  winner_ids: string[]
  prize_per_winner: number
  total_pool_tier: number
}

export interface PrizePool {
  id: string
  draw_id: string
  total_amount: number
  tier_40: number
  tier_35: number
  tier_25: number
}

export interface WinnerVerification {
  id: string
  user_id: string
  draw_id: string
  proof_url: string
  status: VerificationStatus
  payout_status: PayoutStatus
  submitted_at: string | null
  reviewed_at: string | null
}
