'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SimulationForm } from '@/components/pages/simulation-form'

export default function SimulasiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Simulasi Gadai</h1>
            <p className="text-text-muted">
              Pilih cabang otomatis dari API, lalu cari barang dan spesifikasinya untuk melihat estimasi cair.
            </p>
          </div>
          <SimulationForm />
        </div>
      </main>
      <Footer />
    </>
  )
}
