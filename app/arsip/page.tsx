'use client'

import { useEffect, useMemo, useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { CompanyArchive } from '@/lib/types'

function reviveArchive(raw: any): CompanyArchive {
  return { ...raw, id: String(raw.id), year: Number(raw.year), publishedAt: new Date(raw.publishedAt) }
}

export default function ArsipPage() {
  const [items, setItems] = useState<CompanyArchive[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/archives', { cache: 'no-store' })
      .then(response => response.json())
      .then(payload => setItems((payload.data || []).map(reviveArchive)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return items
    return items.filter(item => `${item.title} ${item.documentType} ${item.year}`.toLowerCase().includes(keyword))
  }, [items, query])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-10 md:py-14">
        <div className="site-container">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dokumen Perusahaan</p>
            <h1 className="mt-2 text-4xl font-extrabold text-primary">Arsip</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted">Laporan dan publikasi perusahaan. Data saat ini masih dummy dan sudah disiapkan untuk dikelola dari panel internal.</p>
          </div>

          <div className="mx-auto mt-7 flex max-w-xl items-center gap-2 rounded-lg border border-slate-300 px-4 focus-within:border-primary">
            <Search size={17} className="text-slate-400" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari arsip..." className="h-11 w-full bg-transparent text-sm outline-none" />
          </div>

          {loading ? <div className="py-20 text-center text-sm text-text-muted">Memuat arsip...</div> : (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex aspect-[16/8] items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="text-center">
                      <FileText size={40} className="mx-auto text-accent" />
                      <span className="mt-2 block text-xs font-bold uppercase tracking-wider text-primary">{item.documentType}</span>
                      <span className="mt-1 block text-3xl font-extrabold text-primary">{item.year}</span>
                    </div>
                  </div>
                  <h2 className="mt-4 text-base font-bold text-primary">{item.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{item.description}</p>
                  {item.fileUrl ? (
                    <a href={item.fileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-xs font-bold text-white">Buka Dokumen</a>
                  ) : (
                    <span className="mt-4 inline-flex rounded-md bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">Dokumen dummy</span>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
