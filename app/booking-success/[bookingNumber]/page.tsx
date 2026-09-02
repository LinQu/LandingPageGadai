'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Copy } from 'lucide-react'
import { formatCurrency } from '@/lib/services/booking.service'
import type { BookingData } from '@/lib/types'

export default function BookingSuccessPage({ params }: { params: { bookingNumber: string } }) {
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const data = localStorage.getItem('bookingData')
    if (data) {
      try {
        setBooking(JSON.parse(data))
      } catch (e) {
        console.error('Error parsing booking data')
      }
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(params.bookingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-bg-light py-12">
        <div className="site-container">
          <div className="mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <CheckCircle size={80} className="text-green-500" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Pesanan Berhasil!
            </h1>
            <p className="text-lg text-text-muted mb-8">
              Pesanan Anda telah diterima dan dalam proses verifikasi. Silakan datang ke cabang kami sesuai jadwal.
            </p>
          </motion.div>

          {/* Booking Number Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 bg-white rounded-xl shadow-md mb-8"
          >
            <div className="text-center mb-6">
              <div className="text-sm text-text-muted mb-2">Nomor Pesanan Anda</div>
              <div className="text-3xl font-bold text-primary mb-4">{params.bookingNumber}</div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Copy size={16} />
                {copied ? 'Disalin!' : 'Salin Nomor'}
              </button>
            </div>
          </motion.div>

          {/* Booking Details */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 mb-12"
            >
              <div className="p-6 bg-white rounded-lg">
                <h2 className="text-lg font-bold text-primary mb-4">Detail Pesanan</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Nama</span>
                    <span className="font-semibold text-primary">{booking.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Nomor HP</span>
                    <span className="font-semibold text-primary">{booking.customerPhone}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t">
                    <span className="text-text-muted">Taksiran Nilai</span>
                    <span className="text-xl font-bold text-accent">
                      {formatCurrency(booking.totalValuation)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Status</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {booking.status === 'pending' ? 'Menunggu Verifikasi' : 'Dikonfirmasi'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-6 bg-blue-50 border-l-4 border-blue-400 rounded-lg mb-8"
          >
            <h3 className="font-bold text-primary mb-4">Langkah Selanjutnya</h3>
            <ol className="space-y-3 text-sm text-text-main">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">1.</span>
                <span>Catat nomor pesanan Anda untuk referensi</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">2.</span>
                <span>Datang ke cabang sesuai pesanan dalam waktu 24 jam</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">3.</span>
                <span>Bawa barang original dan dokumen identitas</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600">4.</span>
                <span>Tim kami akan memverifikasi dan Anda akan menerima dana</span>
              </li>
            </ol>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/cek-status-gadai"
              className="flex-1 px-6 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-center"
            >
              Cek Status Gadai
            </Link>
            <Link
              href="/"
              className="flex-1 px-6 py-4 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors text-center"
            >
              Kembali ke Beranda
            </Link>
          </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
