'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CompanyArchive } from '@/lib/types'

export function ArchivePreview() {
  const [items, setItems] = useState<CompanyArchive[]>([])

  useEffect(() => {
    fetch('/api/archives', { cache: 'no-store' })
      .then(response => response.json())
      .then(payload => setItems((payload.data || []).slice(0, 3)))
      .catch(() => setItems([]))
  }, [])

  return (
    <div className="mt-6 grid gap-5 md:grid-cols-3">
      {items.map(item => (
        <Link href="/arsip" key={item.id} className="rounded-xl border border-slate-200 p-5 transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><FileText size={20} /></div>
            <div><span className="block text-[11px] text-slate-400">{item.documentType}</span><strong className="block text-sm text-primary">{item.title}</strong></div>
          </div>
        </Link>
      ))}
      {!items.length ? <div className="md:col-span-3 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-text-muted">Belum ada arsip yang dipublikasikan.</div> : null}
    </div>
  )
}
