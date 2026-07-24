'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, CheckCircle, Clock } from 'lucide-react'
import { getBookingByNumber, getBookingTimeline, formatCurrency } from '@/lib/services/booking.service'
import type { BookingData } from '@/lib/types'

export default function CekPemesananPage() {
  const [bookingNumber, setBookingNumber] = useState('')
  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBooking(null)
    setLoading(true)

    try {
      const data = await getBookingByNumber(bookingNumber)
      if (data) {
        setBooking(data)
      } else {
        setError('Nomor pesanan tidak ditemukan')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari pesanan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-primary mb-2">Cek Status Pesanan</h1>
            <p className="text-text-muted">
              Masukkan nomor pesanan Anda untuk melihat status terkini.
            </p>
          </div>

          {/* Search Form */}
          <motion.form
            onSubmit={handleSearch}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Masukkan nomor pesanan (contoh: GS-2024-001234)"
                value={bookingNumber}
                onChange={e => setBookingNumber(e.target.value)}
                className="flex-1 p-4 border-2 border-border rounded-lg focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading || !bookingNumber}
                className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search size={20} />
                <span className="hidden sm:inline">Cari</span>
              </button>
            </div>
          </motion.form>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-8"
            >
              {error}
            </motion.div>
          )}

          {/* Booking Details */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              {/* Status Timeline */}
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-primary mb-8">Status Pesanan</h2>
                <div className="space-y-6">
                  {getBookingTimeline(booking).map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                            step.completed
                              ? 'bg-green-500 text-white'
                              : step.current
                                ? 'bg-primary text-white ring-4 ring-primary/30'
                                : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {step.completed ? '✓' : step.current ? <Clock size={20} /> : idx + 1}
                        </div>
                        {idx < getBookingTimeline(booking).length - 1 && (
                          <div
                            className={`w-1 h-12 mt-2 ${
                              step.completed ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          ></div>
                        )}
                      </div>
                      <div className="pt-2">
                        <div className="font-bold text-primary">{step.title}</div>
                        <div className="text-sm text-text-muted">{step.description}</div>
                        <div className="text-xs text-text-muted mt-1">
                          {step.timestamp.toLocaleDateString('id-ID')} {step.timestamp.toLocaleTimeString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Booking Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-4">Informasi Pesanan</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-text-muted">Nomor Pesanan</span>
                      <div className="font-semibold text-primary">{booking.bookingNumber}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Tanggal</span>
                      <div className="font-semibold text-primary">
                        {booking.bookingDate.toLocaleDateString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <span className="text-text-muted">Status</span>
                      <div className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {booking.status === 'pending' ? 'Menunggu Verifikasi' : 'Dikonfirmasi'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-bold text-primary mb-4">Informasi Pelanggan</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-text-muted">Nama</span>
                      <div className="font-semibold text-primary">{booking.customerName}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Nomor HP</span>
                      <div className="font-semibold text-primary">{booking.customerPhone}</div>
                    </div>
                    <div>
                      <span className="text-text-muted">Taksiran</span>
                      <div className="font-semibold text-accent text-lg">
                        {formatCurrency(booking.totalValuation)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex gap-3">
                <button
                  onClick={() => setBookingNumber('')}
                  className="flex-1 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  Cari Pesanan Lain
                </button>
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors text-center"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!booking && !loading && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center py-12"
            >
              <div className="text-6xl mb-4">📝</div>
              <p className="text-text-muted">Masukkan nomor pesanan untuk melihat status terkini</p>
            </motion.div>
          )}

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto text-center py-12"
            >
              <div className="inline-block animate-spin">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
              <p className="text-text-muted mt-4">Mencari pesanan...</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
