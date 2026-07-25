'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function CategoriesSection() {
  const categories = [
    { icon: '📱', name: 'Smartphone', emoji: true },
    { icon: '💻', name: 'Laptop', emoji: true },
    { icon: '📷', name: 'Kamera', emoji: true },
    { icon: '🚁', name: 'Drone', emoji: true },
    { icon: '🏍️', name: 'Motor', emoji: true },
    { icon: '📺', name: 'TV/Monitor', emoji: true },
  ]

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
            📦 KATEGORI BARANG
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Apa Saja yang Bisa Digadai?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Gadai Sakti menerima berbagai jenis barang elektronik dan motor dengan harga taksiran yang kompetitif.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 bg-white rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="text-4xl mb-3 text-center">{cat.icon}</div>
              <div className="text-center font-semibold text-primary text-sm">{cat.name}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            href="/simulasi"
            className="inline-block px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            Simulasikan Barang Anda
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section className="py-20 bg-primary-light text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Butuh Dana Mendesak Sekarang Juga?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Jangan tunggu lagi! Gadai barang Anda hari ini dan dapatkan dana dalam waktu kurang dari 30 menit. Proses mudah, cepat, dan terpercaya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/simulasi"
              className="px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Mulai Sekarang
            </Link>
            <Link
              href="/cabang"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Temukan Cabang Kami
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
