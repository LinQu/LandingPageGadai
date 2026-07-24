'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-b from-primary-light/10 to-white pt-20 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div className="inline-block">
                <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full">
                  ⚡ Gadai Paling Cepat & Aman
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-primary leading-tight">
                Gadai Barang dengan Cepat, Aman & Terpercaya
              </h1>

              <p className="text-lg text-text-muted leading-relaxed">
                Gadai smartphone, laptop, motor, dan barang berharga lainnya dengan proses super cepat hanya dalam 30 menit. Taksiran tertinggi hingga 90%, aman diasuransikan, dan resmi berizin OJK.
              </p>

              <ul className="space-y-3">
                {[
                  'Proses cepat hanya 30 menit',
                  'Taksiran hingga 90% dari nilai pasaran',
                  'Barang diasuransikan penuh tanpa biaya',
                  'Resmi berizin OJK',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-text-main font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/simulasi"
                  className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 group"
                >
                  Mulai Simulasi
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/cabang"
                  className="px-8 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary-light/5 transition-colors"
                >
                  Lokasi Terdekat
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full flex items-center justify-center">
              <img
                src="/hero-banner.png.png"
                alt="Hero Banner Gadai Sakti"
                className="w-full max-w-[640px] xl:max-w-[700px] h-auto object-contain drop-shadow-xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
