'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import { Heart, Plus, Trash2, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Charity } from '@/types'

interface Props {
  initialCharities: Charity[]
}

export default function AdminCharitiesClient({ initialCharities }: Props) {
  const [charities, setCharities] = useState<Charity[]>(initialCharities)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const _router = useRouter()

  async function create() {
    if (!name.trim()) return
    setLoading('create')
    const res = await fetch('/api/admin/charities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, images: [], events: [], featured: false }),
    })
    const data = await res.json()
    if (data.charity) setCharities(prev => [data.charity, ...prev])
    setName('')
    setDescription('')
    setCreating(false)
    setLoading(null)
  }

  async function toggleFeatured(charity: Charity) {
    setLoading(charity.id)
    await fetch('/api/admin/charities', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: charity.id, featured: !charity.featured }),
    })
    setCharities(prev => prev.map(c => c.id === charity.id ? { ...c, featured: !c.featured } : c))
    setLoading(null)
  }

  async function remove(id: string) {
    if (!confirm('Delete this charity?')) return
    setLoading(id)
    await fetch(`/api/admin/charities?id=${id}`, { method: 'DELETE' })
    setCharities(prev => prev.filter(c => c.id !== id))
    setLoading(null)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Charities</h1>
          <p className="text-white/40 mt-1">{charities.length} charities in the directory</p>
        </div>
        <Button onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Charity
        </Button>
      </div>

      {creating && (
        <Card>
          <h2 className="font-semibold text-white mb-4">Add New Charity</h2>
          <div className="space-y-4">
            <Input id="name" label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="Charity name" />
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Brief description of the charity"
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={create} loading={loading === 'create'}>Add Charity</Button>
            <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {charities.map((charity) => (
          <Card key={charity.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{charity.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {charity.featured && <Badge variant="success">Featured</Badge>}
                    <Badge variant={charity.active ? 'success' : 'neutral'}>
                      {charity.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleFeatured(charity)}
                  disabled={loading === charity.id}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${charity.featured ? 'text-accent-400 bg-accent-400/10' : 'text-white/30 hover:text-accent-400 hover:bg-accent-400/10'}`}
                  title={charity.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className="w-4 h-4" fill={charity.featured ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={() => remove(charity.id)}
                  disabled={loading === charity.id}
                  className="w-8 h-8 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {charity.description && (
              <p className="text-xs text-white/40 mt-3 leading-relaxed line-clamp-2">{charity.description}</p>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
