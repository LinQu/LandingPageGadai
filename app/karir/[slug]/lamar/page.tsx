import { notFound } from 'next/navigation'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CareerHero } from '@/components/career/career-hero'
import { ApplicationForm } from '@/components/career/application-form'
import { getCareerJobBySlug } from '@/lib/services/career.service'

export default async function ApplyCareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await getCareerJobBySlug(slug)
  if (!job) notFound()
  return (
    <>
      <Header />
      <main className="bg-white">
        <CareerHero />
        <section className="py-10 md:py-14">
          <div className="site-container">
            <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Lamaran: {job.title}</p><h2 className="mt-2 text-4xl font-extrabold text-primary md:text-5xl">Formulir Data Diri</h2></div>
            <div className="mt-8"><ApplicationForm slug={job.slug} jobTitle={job.title} /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
