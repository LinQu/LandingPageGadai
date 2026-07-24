'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { getArticles, searchArticles, getArticleCategories } from '@/lib/services/article.service'
import type { Article } from '@/lib/types'

export default function ArtikelPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const [articlesData, categoriesData] = await Promise.all([
        getArticles(),
        Promise.resolve(getArticleCategories()),
      ])
      setArticles(articlesData)
      setFilteredArticles(articlesData)
      setCategories(categoriesData)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let result = articles

    if (selectedCategory) {
      result = result.filter(a => a.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        a =>
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      )
    }

    setFilteredArticles(result)
  }, [articles, selectedCategory, searchQuery])

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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Artikel & Tips
            </h1>
            <p className="text-lg text-text-muted max-w-2xl">
              Pelajari tips dan trik untuk mendapatkan taksiran terbaik untuk barang Anda.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedCategory === ''
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border hover:border-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Articles Grid */}
          {filteredArticles.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredArticles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
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
                        <span className="text-xs text-text-muted">{article.readTime} min</span>
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-text-muted">Tidak ada artikel yang sesuai dengan pencarian Anda.</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
