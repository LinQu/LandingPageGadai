'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { getArticleBySlug } from '@/lib/services/article.service'
import type { Article } from '@/lib/types'

export default function ArtikelDetailPage({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadArticle = async () => {
      const data = await getArticleBySlug(params.slug)
      setArticle(data)
      setLoading(false)
    }
    loadArticle()
  }, [params.slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-bg-light py-12">
          <div className="text-center text-text-muted">Memuat artikel...</div>
        </main>
        <Footer />
      </>
    )
  }

  if (!article) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-bg-light py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">Artikel tidak ditemukan</h1>
              <Link href="/artikel" className="text-primary hover:underline">
                Kembali ke daftar artikel
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        >
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Kembali ke Artikel
          </Link>
        </motion.div>

        {/* Article */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-semibold">
                {article.category}
              </span>
            </div>

            <h1 className="text-5xl font-bold text-primary mb-6">{article.title}</h1>

            <div className="flex flex-wrap gap-6 text-sm text-text-muted mb-8">
              <div className="flex items-center gap-2">
                <User size={16} />
                {article.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                {article.publishedAt.toLocaleDateString('id-ID')}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                {article.readTime} min baca
              </div>
            </div>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full rounded-lg shadow-lg object-cover max-h-96"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-lg max-w-none mb-12"
          >
            <div className="space-y-6 text-text-main leading-relaxed">
              <p className="text-lg">{article.description}</p>
              <p>{article.content}</p>
              <p className="italic text-text-muted">
                Artikel ini memberikan informasi umum dan tidak boleh dianggap sebagai saran profesional. Untuk informasi lebih lanjut, silakan hubungi kami.
              </p>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-primary/5 border-l-4 border-primary rounded-lg mb-12"
          >
            <h3 className="text-2xl font-bold text-primary mb-3">Siap untuk gadai barang Anda?</h3>
            <p className="text-text-muted mb-6">
              Mulai simulasi sekarang dan dapatkan taksiran nilai barang Anda dalam hitungan menit.
            </p>
            <Link
              href="/simulasi"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Simulasi Sekarang
            </Link>
          </motion.div>
        </article>
      </main>
      <Footer />
    </>
  )
}
