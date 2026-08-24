'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'
import { getFAQs } from '@/lib/services/misc.service'
import { getFeaturedArticles } from '@/lib/services/article.service'
import type { FAQItem } from '@/lib/types'

export function FAQSection() {
  const [openId, setOpenId] = useState<string>('1')
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadFAQs() {
      const data = await getFAQs()
      if (!active) return
      setFaqs(data)
      setLoading(false)
      if (data.length > 0) setOpenId(data[0].id)
    }

    void loadFAQs()
    return () => {
      active = false
    }
  }, [])

  return (
    <section id="faq" className="bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Pusat Bantuan</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-[44px]">
            Pertanyaan yang Sering Diajukan
          </h2>

          <div className="mt-8 max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-950/10">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 text-primary">
                <MessageCircle size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-primary">Masih Ada yang Ingin Ditanyakan?</h3>
                <p className="mt-2 text-xs leading-5 text-text-muted">
                  Hubungi layanan pelanggan kami untuk mendapatkan informasi yang lebih lengkap dan jelas.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/6281125201419?text=Halo%20Admin%20Gadai%20Sakti.%0A%0ASaya%20ingin%20mendapatkan%20informasi%20mengenai%20layanan%20gadai.%0A%0ATerima%20kasih."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex rounded-md bg-accent px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Hubungi Kami
            </a>
          </div>
        </motion.div>

        <div>
          {loading ? (
            <div className="py-8 text-sm text-text-muted">Memuat pertanyaan...</div>
          ) : (
            <div className="divide-y divide-slate-300 border-y border-slate-300">
              {faqs.map((faq, index) => {
                const isOpen = openId === faq.id
                return (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.035 }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? '' : faq.id)}
                      className="flex w-full items-center justify-between gap-4 py-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-bold text-slate-800">{faq.question}</span>
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-500">
                        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {isOpen ? (
                      <div className="pb-5 pr-10 text-xs leading-5 text-text-muted sm:text-sm sm:leading-6">
                        {faq.answer}
                      </div>
                    ) : null}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function ArticlesSection() {
  const [articles, setArticles] = useState<Awaited<ReturnType<typeof getFeaturedArticles>>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadArticles() {
      const data = await getFeaturedArticles()
      if (!active) return
      setArticles(data)
      setLoading(false)
    }

    void loadArticles()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="bg-bg-light py-16">
        <div className="text-center text-sm text-text-muted">Memuat artikel...</div>
      </section>
    )
  }

  return (
    <section className="bg-bg-light py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Artikel & Tips</p>
            <h2 className="mt-2 text-3xl font-bold text-primary">Informasi Terbaru</h2>
          </div>
          <Link href="/artikel" className="text-sm font-semibold text-primary hover:text-accent">
            Lihat semua
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {articles.map(article => (
            <Link key={article.id} href={`/artikel/${article.slug}`} className="rounded-xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{article.category}</p>
              <h3 className="mt-2 text-base font-bold text-primary">{article.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-muted">{article.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
