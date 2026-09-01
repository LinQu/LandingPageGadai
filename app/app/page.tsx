import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroSection } from '@/components/sections/hero'
import { CategoriesSection } from '@/components/sections/categories'
import { BranchLocatorSection } from '@/components/sections/branch-locator'
import { ProcessSection, TestimonialsSection } from '@/components/sections/process-testimonials'
import { FAQSection } from '@/components/sections/faq-articles'

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <BranchLocatorSection />
        <ProcessSection />
        <TestimonialsSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  )
}
