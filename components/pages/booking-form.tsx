'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { createBooking, formatCurrency } from '@/lib/services/booking.service'
import type { SimulationData } from '@/lib/types'

export function BookingForm() {
  const router = useRouter()
  const [simulation, setSimulation] = useState<Partial<SimulationData> | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })

  useEffect(() => {
    const data = localStorage.getItem('simulationData')
    if (data) {
      try {
        setSimulation(JSON.parse(data))
      } catch (e) {
        router.push('/simulasi')
      }
    } else {
      router.push('/simulasi')
    }
    setLoading(false)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const booking = await createBooking({
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        branch: {
          id: simulation?.branch?.id || '',
          name: simulation?.branch?.NamaCabang || '',
        },
        itemDetails: simulation as SimulationData,
        totalValuation: simulation?.valuation || 0,
      })

      localStorage.setItem('bookingData', JSON.stringify(booking))
      router.push(`/booking-success/${booking.bookingNumber}`)
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center text-text-muted">Memuat data...</div>
  }

  if (!simulation) {
    return <div className="text-center text-text-muted">Data tidak ditemukan</div>
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-sm"
    >
      {/* Item Summary */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="text-sm text-text-muted mb-2">Ringkasan Item</div>
        <div className="font-semibold text-primary mb-2">
          {simulation.itemName
            ? `${simulation.itemName}${simulation.specification ? ` ${simulation.specification}` : ''}`
            : `${simulation.brand?.name} ${simulation.series?.name} ${simulation.variant?.name}`}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-muted">Taksiran:</span>
          <span className="text-xl font-bold text-accent">
            {formatCurrency(simulation.valuation || simulation.valuationMax || 0)}
          </span>
        </div>
        {simulation.valuationMin && simulation.valuationMax ? (
          <div className="flex justify-between items-center text-sm text-text-muted mt-2">
            <span>Estimasi cair:</span>
            <span>
              {formatCurrency(simulation.valuationMin)} - {formatCurrency(simulation.valuationMax)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between items-center text-sm text-text-muted mt-2">
          <span>Cabang:</span>
          <span>
            {simulation.branch?.NamaCabang}
            {simulation.branchCode ? ` (${simulation.branchCode})` : ''}
          </span>
        </div>
      </div>

      {/* Form Fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-primary mb-2">
          Nama Lengkap
        </label>
        <input
          id="name"
          type="text"
          required
          placeholder="Masukkan nama lengkap Anda"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-primary mb-2">
          Nomor HP
        </label>
        <input
          id="phone"
          type="tel"
          required
          placeholder="+62812345678"
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
          Email (Opsional)
        </label>
        <input
          id="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-3 border border-border rounded-lg focus:outline-none focus:border-primary"
        />
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-xs text-text-muted">
          <strong>Catatan:</strong> Pesanan ini akan berlaku 24 jam. Silakan datang ke cabang dengan membawa barang original dan dokumen identitas Anda.
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? 'Memproses...' : 'Buat Pesanan'} <ChevronRight size={20} />
      </button>

      <p className="text-center text-xs text-text-muted">
        Dengan melanjutkan, Anda menyetujui{' '}
        <a href="#" className="text-primary hover:underline">
          Syarat & Ketentuan
        </a>{' '}
        kami.
      </p>
    </motion.form>
  )
}
