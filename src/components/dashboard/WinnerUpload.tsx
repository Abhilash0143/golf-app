'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  verificationId: string // available for future detailed lookup
  drawId: string
}

export default function WinnerUpload({ verificationId: _verificationId, drawId }: Props) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()

  async function submit() {
    if (!url.trim()) return
    setLoading(true)
    await fetch('/api/winners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId, proofUrl: url }),
    })
    setLoading(false)
    setDone(true)
    router.refresh()
  }

  if (done) return <p className="text-sm text-brand-400 mt-4">Proof submitted for review!</p>

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <p className="text-sm text-white/60 mb-3 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Upload your score verification proof
      </p>
      <div className="flex gap-3">
        <input
          type="url"
          placeholder="Screenshot URL (e.g. from Imgur, Google Drive)"
          value={url}
          onChange={e => setUrl(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <Button size="sm" onClick={submit} loading={loading} disabled={!url.trim()}>
          Submit
        </Button>
      </div>
    </div>
  )
}
