'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SimulationForm } from '@/components/pages/simulation-form'

export default function SimulasiPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f8fb] py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SimulationForm stage="setup" />
        </div>
      </main>
      <Footer />
    </>
  )
}
