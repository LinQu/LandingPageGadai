'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { BookingForm } from '@/components/pages/booking-form'

export default function BookingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Konfirmasi Pesanan</h1>
            <p className="text-text-muted">
              Isi data diri Anda untuk melanjutkan proses gadai.
            </p>
          </div>
          <BookingForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
