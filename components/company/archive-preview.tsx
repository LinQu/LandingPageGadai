'use client'

import Link from 'next/link'
import { ExternalLink, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CompanyArchive } from '@/lib/types'

export function ArchivePreview() {
  const [items, setItems] = useState<CompanyArchive[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/archives', { cache: 'no-store' })
      .then(response => response.json())
      .then(payload => setItems(payload.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="h-6 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-full rounded bg-slate-200" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 6).map(item => (
        <div
          key={item.id}
          className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                {item.documentType}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                {item.year}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                <FileText size={22} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold leading-snug text-primary group-hover:text-accent transition-colors line-clamp-2">
                  {item.title}
                </h3>
                {item.description ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {item.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-400">Dokumen PDF</span>
            {item.fileUrl ? (
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
              >
                <span>Buka PDF</span>
                <ExternalLink size={13} />
              </a>
            ) : (
              <Link
                href="/arsip"
                className="text-xs font-bold text-primary hover:text-accent inline-flex items-center gap-1"
              >
                <span>Lihat Detail</span>
                <span>→</span>
              </Link>
            )}
          </div>
        </div>
      ))}
      {!items.length ? (
        <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          Belum ada arsip yang dipublikasikan.
        </div>
      ) : null}
    </div>
  )
}
