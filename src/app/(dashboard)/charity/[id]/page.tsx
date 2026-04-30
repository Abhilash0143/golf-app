export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Heart, Calendar, ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function CharityProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [charityRes, contributionsRes, userRes] = await Promise.all([
    supabase.from('charities').select('*').eq('id', params.id).single(),
    supabase.from('charity_contributions').select('amount').eq('charity_id', params.id),
    supabase.from('users').select('charity_id').eq('id', user.id).single(),
  ])

  if (!charityRes.data) notFound()
  const charity = charityRes.data
  const totalRaised = (contributionsRes.data || []).reduce((sum, c) => sum + c.amount, 0)
  const isMyCharity = userRes.data?.charity_id === charity.id

  async function selectCharity() {
    'use server'
  }

  return (
    <div className="space-y-8">
      <Link href="/charity" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Charities
      </Link>

      {/* Header */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center">
              <Heart className="w-8 h-8 text-brand-400" fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{charity.name}</h1>
                {charity.featured && <Badge variant="success">Featured</Badge>}
              </div>
              <p className="text-white/50">{charity.description}</p>
            </div>
          </div>
          {isMyCharity ? (
            <Badge variant="success" className="text-sm px-4 py-2">Your Chosen Charity</Badge>
          ) : (
            <form action={async () => {
              'use server'
              const supabase = createClient()
              const { data: { user } } = await supabase.auth.getUser()
              if (user) await supabase.from('users').update({ charity_id: params.id }).eq('id', user.id)
              redirect('/charity')
            }}>
              <Button type="submit" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Choose This Charity
              </Button>
            </form>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-brand-400">
              £{(totalRaised / 100).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-white/40 mt-1">Total Raised</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-white">{contributionsRes.data?.length || 0}</p>
            <p className="text-xs text-white/40 mt-1">Contributions</p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-accent-400">{charity.featured ? 'Yes' : 'No'}</p>
            <p className="text-xs text-white/40 mt-1">Featured</p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-purple-400" />
          <h2 className="font-semibold text-white">Upcoming Golf Events</h2>
        </div>
        {charity.events && charity.events.length > 0 ? (
          <div className="space-y-3">
            {charity.events.map((event: string, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 glass rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm text-white/70">{event}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">No upcoming events scheduled</p>
        )}
      </Card>

      {/* Images */}
      {charity.images && charity.images.length > 0 && (
        <Card>
          <h2 className="font-semibold text-white mb-4">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {charity.images.map((img: string, i: number) => (
              <img key={i} src={img} alt={charity.name}
                className="w-full h-32 object-cover rounded-xl" />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
