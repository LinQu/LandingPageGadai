'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export function TrustSection() {
  const reasons = [
    {
      icon: '🏦',
      title: 'Berizin OJK',
      description: 'Resmi terdaftar dan berizin dari Otoritas Jasa Keuangan',
    },
    {
      icon: '🛡️',
      title: 'Barang Diasuransikan',
      description: 'Setiap barang diamankan dengan asuransi komprehensif tanpa biaya tambahan',
    },
    {
      icon: '⚡',
      title: 'Proses Cepat',
      description: 'Proses gadai hanya butuh waktu 30 menit dari awal hingga selesai',
    },
    {
      icon: '💯',
      title: 'Taksiran Adil',
      description: 'Taksiran transparan dengan harga hingga 90% dari nilai pasaran',
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
            ✓ TERPERCAYA
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Kenapa Memilih Gadai Sakti?
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Kami adalah pilihan terbaik untuk kebutuhan gadai Anda dengan komitmen penuh pada keamanan, kecepatan, dan kepercayaan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 bg-bg-light rounded-xl hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{reason.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{reason.title}</h3>
              <p className="text-sm text-text-muted">{reason.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StatsSection() {
  const stats = [
    { value: '50,000+', label: 'Pelanggan Puas' },
    { value: '100M+', label: 'Total Pinjaman' },
    { value: '5 Kota', label: 'Lokasi Cabang' },
    { value: '99%', label: 'Kepuasan Pelanggan' },
  ]

  return (
    <section className="py-20 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
