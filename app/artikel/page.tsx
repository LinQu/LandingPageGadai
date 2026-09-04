'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getArticles } from '@/lib/services/article.service'
import type { Article } from '@/lib/types'

const PAGE_SIZE = 9

export default function ArtikelPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticles()
      .then(setArticles)
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return articles
    return articles.filter(article =>
      [article.title, article.description, article.category]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    )
  }, [articles, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const updateQuery = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-100 py-10 md:py-14">
          <div className="site-container">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Artikel Gadai Sakti</p>
              <h1 className="mt-2 text-3xl font-extrabold uppercase tracking-wide text-primary md:text-5xl">
                Artikel Terbaru Pilihan
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted">
                Tips, edukasi, dan informasi yang membantu Anda memahami proses gadai dengan lebih mudah.
              </p>
            </div>

            <div className="mx-auto mt-7 flex max-w-2xl overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:border-primary">
              <div className="flex flex-1 items-center gap-2 px-4">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={event => updateQuery(event.target.value)}
                  placeholder="Cari artikel..."
                  className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              <button type="button" className="bg-accent px-6 text-sm font-semibold text-white">Cari</button>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="site-container">
            {loading ? (
              <div className="py-24 text-center text-sm text-text-muted">Memuat artikel...</div>
            ) : visible.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visible.map(article => (
                  <article key={article.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                    <Link href={`/artikel/${article.slug}`}>
                      <div className="aspect-[16/8.8] overflow-hidden bg-slate-100">
                        <img src={article.image || '/placeholder.jpg'} alt={article.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="p-5">
                        <div className="mb-3 flex items-center justify-between gap-3 text-[11px]">
                          <span className="rounded-full bg-accent/10 px-2.5 py-1 font-bold text-accent">{article.category}</span>
                          <time className="text-slate-400">{article.publishedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</time>
                        </div>
                        <h2 className="text-lg font-bold leading-6 text-primary transition group-hover:text-accent">{article.title}</h2>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-muted">{article.description}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Baca Selengkapnya <ArrowRight size={16} /></span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 py-20 text-center text-sm text-text-muted">
                Tidak ada artikel yang cocok dengan pencarian Anda.
              </div>
            )}

            {!loading && filtered.length > 0 ? (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(value => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-primary disabled:opacity-30"
                  aria-label="Halaman sebelumnya"
                >
                  <ArrowLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => setPage(number)}
                    className={`h-9 min-w-9 rounded px-2 text-sm font-semibold ${number === currentPage ? 'bg-primary text-white' : 'text-primary hover:bg-slate-100'}`}
                  >
                    {number}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage(value => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded border border-slate-300 text-primary disabled:opacity-30"
                  aria-label="Halaman berikutnya"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
