import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/sections/hero'
import { TrustSection, StatsSection } from '@/components/sections/trust'
import { CategoriesSection, CTASection } from '@/components/sections/categories'
import { ProcessSection, TestimonialsSection } from '@/components/sections/process-testimonials'
import { FAQSection, ArticlesSection } from '@/components/sections/faq-articles'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <TrustSection />
        <StatsSection />
        <CategoriesSection />
        <ProcessSection />
        <TestimonialsSection />
        <FAQSection />
        <ArticlesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
