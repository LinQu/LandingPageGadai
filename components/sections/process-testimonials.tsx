'use client'

import { motion } from 'framer-motion'
import { getTestimonials, getAverageRating } from '@/lib/services/misc.service'
import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

export function ProcessSection() {
  const steps = [
    {
      number: 1,
      title: 'Pilih Barang',
      description: 'Tentukan barang yang ingin Anda gadai melalui simulasi kami',
    },
    {
      number: 2,
      title: 'Dapatkan Taksiran',
      description: 'Lihat taksiran nilai barang Anda hingga 90% dari nilai pasaran',
    },
    {
      number: 3,
      title: 'Buat Pesanan',
      description: 'Isi data diri Anda dan pilih cabang Gadai Sakti terdekat',
    },
    {
      number: 4,
      title: 'Kunjungi Cabang',
      description: 'Datang ke cabang dengan membawa dokumen dan barang Anda',
    },
    {
      number: 5,
      title: 'Verifikasi',
      description: 'Tim kami akan memverifikasi dan mengkonfirmasi taksiran Anda',
    },
    {
      number: 6,
      title: 'Terima Dana',
      description: 'Dapatkan dana Anda dalam waktu kurang dari 30 menit',
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
            🚀 CARA KERJA
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Proses Gadai yang Sangat Mudah
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Hanya 6 langkah sederhana untuk mendapatkan dana yang Anda butuhkan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-12 w-8 h-0.5 bg-accent/20"></div>
              )}

              <div className="p-8 bg-bg-light rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-primary">{step.title}</h3>
                </div>
                <p className="text-text-muted text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTestimonials() {
      const data = await getTestimonials()
      setTestimonials(data)
      setAverageRating(getAverageRating())
      setLoading(false)
    }
    loadTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-bg-light">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-text-muted">Memuat testimoni...</div>
        </div>
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
            ⭐ TESTIMONI
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Apa Kata Pelanggan Kami?
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.round(averageRating) ? 'fill-accent text-accent' : 'text-gray-300'}
              />
            ))}
          </div>
          <p className="text-lg text-text-muted">Rata-rata {averageRating.toFixed(1)} / 5 dari {testimonials.length} pelanggan</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-text-muted mb-4 italic">&quot;{testimonial.content}&quot;</p>
              <div className="border-t pt-4">
                <div className="font-semibold text-primary text-sm">{testimonial.name}</div>
                <div className="text-xs text-text-muted">{testimonial.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
