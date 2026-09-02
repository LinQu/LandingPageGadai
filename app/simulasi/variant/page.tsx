import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SimulationForm } from '@/components/pages/simulation-form'

export default function SimulasiVariantPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f8fb] py-10 sm:py-12">
        <div className="site-container">
          <div className="mx-auto max-w-5xl">
            <SimulationForm stage="variant" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
