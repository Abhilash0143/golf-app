'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Heart, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Charity } from '@/types'

const plans = [
  { id: 'monthly', label: 'Monthly', price: '£10', period: '/month', desc: 'Best for trying it out' },
  { id: 'yearly', label: 'Yearly', price: '£100', period: '/year', desc: 'Save £20 vs monthly', badge: 'Best Value' },
]

const steps = ['Plan', 'Account', 'Charity']

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charities, setCharities] = useState<Charity[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/charities')
      .then(r => r.json())
      .then(d => setCharities(d.charities || []))
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, plan } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      setUserId(data.user.id)
      setStep(3)
    }
    setLoading(false)
  }

  async function handleFinish() {
    if (!userId) return
    setLoading(true)

    await fetch('/api/subscriptions/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, plan, charityId: selectedCharityId }),
    })

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-brand-500/5 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-bold text-xl gradient-text">GolfGive</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Start making an impact</h1>
          <p className="text-white/40 mt-1">Play golf. Support charity. Win prizes.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                step > i + 1 ? 'bg-brand-500 text-white' :
                step === i + 1 ? 'bg-brand-500 text-white ring-4 ring-brand-500/20' :
                'bg-white/10 text-white/30'
              )}>
                {step > i + 1 ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={cn('text-xs hidden sm:block', step === i + 1 ? 'text-white' : 'text-white/30')}>{s}</span>
              {i < steps.length - 1 && <div className={cn('w-8 h-px', step > i + 1 ? 'bg-brand-500' : 'bg-white/10')} />}
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-8">
          {/* Step 1: Plan */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Choose your plan</h2>
              <div className="grid grid-cols-2 gap-4">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlan(p.id as 'monthly' | 'yearly')}
                    className={cn(
                      'relative rounded-xl p-5 text-left border transition-all duration-200',
                      plan === p.id ? 'border-brand-500 bg-brand-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'
                    )}
                  >
                    {p.badge && (
                      <span className="absolute -top-2 left-3 text-xs font-semibold bg-brand-500 text-white px-2 py-0.5 rounded-full">
                        {p.badge}
                      </span>
                    )}
                    {plan === p.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <p className="font-bold text-xl text-white">{p.price}</p>
                    <p className="text-xs text-white/40">{p.period}</p>
                    <p className="text-sm font-medium text-white mt-2">{p.label}</p>
                    <p className="text-xs text-white/40 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
              <div className="glass rounded-xl p-4 text-sm text-white/50">
                <p className="font-medium text-white/70 mb-1">What you get:</p>
                <ul className="space-y-1">
                  <li>• Enter up to 5 scores per month into the draw</li>
                  <li>• At least 10% goes to your chosen charity</li>
                  <li>• Access to full dashboard and draw history</li>
                </ul>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" size="lg">
                Continue with {plan === 'monthly' ? '£10/month' : '£100/year'}
              </Button>
            </div>
          )}

          {/* Step 2: Account */}
          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-5">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-white/40 hover:text-white flex items-center gap-1 mb-2">
                ← Back
              </button>
              <h2 className="text-lg font-semibold text-white">Create your account</h2>
              <Input id="name" label="Full name" type="text" placeholder="John Smith"
                value={name} onChange={e => setName(e.target.value)} required />
              <Input id="email" label="Email address" type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <Input id="password" label="Password" type="password" placeholder="Min 8 characters"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
              {error && (
                <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Continue
              </Button>
            </form>
          )}

          {/* Step 3: Charity selection */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Choose your charity</h2>
                <p className="text-sm text-white/40 mt-1">At least 10% of your subscription goes here every month</p>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {charities.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCharityId(c.id)}
                    className={cn(
                      'w-full text-left rounded-xl p-4 border transition-all duration-200 flex items-center gap-3',
                      selectedCharityId === c.id
                        ? 'border-brand-500 bg-brand-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    )}
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{c.name}</p>
                      <p className="text-xs text-white/40 truncate">{c.description}</p>
                    </div>
                    {selectedCharityId === c.id && (
                      <div className="w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button onClick={handleFinish} loading={loading} className="w-full" size="lg"
                disabled={!selectedCharityId}>
                {selectedCharityId ? 'Complete Setup' : 'Select a charity to continue'}
              </Button>
              <button onClick={handleFinish} className="w-full text-xs text-white/30 hover:text-white/50 text-center">
                Skip for now
              </button>
            </div>
          )}

          <p className="text-center text-sm text-white/40 mt-6">
            Already a member?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
