'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { getFAQs } from '@/lib/services/misc.service'
import { getFeaturedArticles } from '@/lib/services/article.service'

export function FAQSection() {
  const [openId, setOpenId] = useState<string>('1')
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFAQs() {
      const data = await getFAQs()
      setFaqs(data)
      setLoading(false)
    }
    loadFAQs()
  }, [])

  if (loading) {
    return (
      <section id="faq" className="py-20 bg-white">
        <div className="text-center text-text-muted">Memuat FAQ...</div>
      </section>
    )
  }

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
            ❓ FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-lg text-text-muted">
            Temukan jawaban atas pertanyaan umum tentang layanan gadai kami.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? '' : faq.id)}
                className="w-full px-6 py-4 flex items-center justify-between bg-bg-light hover:bg-primary-light/5 transition-colors"
              >
                <span className="font-semibold text-left text-primary">{faq.question}</span>
                <ChevronDown
                  className={`flex-shrink-0 text-primary transition-transform ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                  size={20}
                />
              </button>
              {openId === faq.id && (
                <div className="px-6 py-4 border-t border-border bg-white">
                  <p className="text-text-muted leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-text-muted mb-4">Masih punya pertanyaan?</p>
          <a
            href="https://wa.me/6281125201419?text=Halo%20Admin%20Gadai%20Sakti.%0A%0ASaya%20baru%20saja%20melihat%20website%20Gadai%20Sakti%20dan%20ingin%20mendapatkan%20informasi%20mengenai%20layanan%20gadai.%0A%0AMohon%20bantu%20informasinya.%0A%0ATerima%20kasih."
            className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Hubungi Kami
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export function ArticlesSection() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadArticles() {
      const data = await getFeaturedArticles()
      setArticles(data)
      setLoading(false)
    }
    loadArticles()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-bg-light">
        <div className="text-center text-text-muted">Memuat artikel...</div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
            📰 ARTIKEL & TIPS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Tips & Informasi Terbaru
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Pelajari tips dan trik untuk mendapatkan taksiran terbaik untuk barang Anda.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {articles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <Link href={`/artikel/${article.slug}`} className="block">
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded font-semibold">
                      {article.category}
                    </span>
                    <span className="text-xs text-text-muted">{article.readTime} min read</span>
                  </div>
                  <h3 className="font-bold text-primary mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-2 mb-4">
                    {article.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">{article.author}</span>
                    <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/artikel"
            className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Lihat Semua Artikel
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
