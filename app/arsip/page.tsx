'use client'

import { useEffect, useMemo, useState } from 'react'
import { ExternalLink, FileText, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import type { CompanyArchive } from '@/lib/types'

function reviveArchive(raw: any): CompanyArchive {
  return { ...raw, id: String(raw.id), year: Number(raw.year), publishedAt: new Date(raw.publishedAt) }
}

export default function ArsipPage() {
  const [items, setItems] = useState<CompanyArchive[]>([])
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/archives', { cache: 'no-store' })
      .then(response => response.json())
      .then(payload => setItems((payload.data || []).map(reviveArchive)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const documentTypes = useMemo(() => {
    const types = Array.from(new Set(items.map(i => i.documentType).filter(Boolean)))
    return ['all', ...types]
  }, [items])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return items.filter(item => {
      const matchesType = selectedType === 'all' || item.documentType === selectedType
      const matchesQuery = !keyword || `${item.title} ${item.documentType} ${item.year} ${item.description}`.toLowerCase().includes(keyword)
      return matchesType && matchesQuery
    })
  }, [items, query, selectedType])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50/50 py-10 md:py-16">
        <div className="site-container">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Dokumen Resmi Perusahaan</p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-primary">Arsip &amp; Publikasi</h1>
            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Laporan Keberlanjutan dan Laporan Keuangan Audited resmi PT Gadai Sakti Indonesia yang dapat diakses dan diunduh oleh publik.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mx-auto mt-8 max-w-2xl space-y-4">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Cari laporan (keberlanjutan, keuangan, banten, jakarta...)"
                className="w-full bg-transparent text-xs sm:text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Type Filter Tabs */}
            {documentTypes.length > 2 ? (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {documentTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      selectedType === type
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {type === 'all' ? 'Semua Dokumen' : type}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="py-20 text-center text-sm text-slate-400">Memuat arsip dokumen...</div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500 shadow-sm">
              {query || selectedType !== 'all'
                ? 'Tidak ada arsip yang cocok dengan filter pencarian Anda.'
                : 'Belum ada arsip yang dipublikasikan.'}
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(item => (
                <article
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-accent">
                        {item.documentType}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {item.year}
                      </span>
                    </div>

                    <div className="mt-4 flex items-start gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200 shadow-inner">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-primary group-hover:text-accent transition-colors leading-snug">
                          {item.title}
                        </h2>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">PDF Document</span>
                    {item.fileUrl ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary-dark shadow-sm"
                      >
                        <span>Buka Dokumen</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400">File belum tersedia</span>
                    )}
                  </div>
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
