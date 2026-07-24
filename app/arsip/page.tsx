'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Package } from 'lucide-react'
import { getArchiveItems } from '@/lib/services/misc.service'
import { formatCurrency } from '@/lib/services/booking.service'
import type { ArchiveItem } from '@/lib/types'

export default function ArsipPage() {
  const [items, setItems] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItems = async () => {
      const data = await getArchiveItems()
      setItems(data)
      setLoading(false)
    }
    loadItems()
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-bg-light py-12">
          <div className="text-center text-text-muted">Memuat arsip...</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-primary mb-2">Riwayat Gadai</h1>
            <p className="text-text-muted">
              Lihat semua riwayat gadai Anda di sini.
            </p>
          </motion.div>

          {/* Items List */}
          {items.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* Booking Number */}
                    <div>
                      <div className="text-xs text-text-muted mb-1">Nomor Pesanan</div>
                      <div className="font-semibold text-primary">{item.bookingNumber}</div>
                    </div>

                    {/* Item Name */}
                    <div>
                      <div className="text-xs text-text-muted mb-1">Item</div>
                      <div className="font-semibold text-primary line-clamp-2">{item.itemName}</div>
                    </div>

                    {/* Valuation */}
                    <div>
                      <div className="text-xs text-text-muted mb-1">Taksiran</div>
                      <div className="font-semibold text-accent">
                        {formatCurrency(item.valuation)}
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <div className="text-xs text-text-muted mb-1">Tanggal</div>
                      <div className="text-sm text-primary flex items-center gap-2">
                        <Calendar size={16} />
                        {item.bookingDate.toLocaleDateString('id-ID')}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-yellow-100 text-yellow-700'
                            : item.status === 'redeemed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.status === 'active'
                          ? 'Aktif'
                          : item.status === 'redeemed'
                            ? 'Ditebus'
                            : 'Diperpanjang'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-text-muted">Belum ada riwayat gadai.</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
