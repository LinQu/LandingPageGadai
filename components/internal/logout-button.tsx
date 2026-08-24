'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        await fetch('/api/internal/auth/logout', { method: 'POST' }).catch(() => undefined)
        router.replace('/internal/login')
        router.refresh()
      }}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      <LogOut size={17} /> {loading ? 'Keluar...' : 'Keluar'}
    </button>
  )
}
