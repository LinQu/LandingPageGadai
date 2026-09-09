'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CareerHero } from '@/components/career/career-hero'
import { ApplicationForm } from '@/components/career/application-form'
import { getCareerJobBySlug } from '@/lib/services/career.service'
import type { CareerJob } from '@/lib/types'

export default function ApplyCareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [job, setJob] = useState<CareerJob | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    getCareerJobBySlug(slug)
      .then(data => {
        if (active) {
          setJob(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setJob(null)
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-white">
          <CareerHero />
          <section className="py-20 text-center text-sm text-text-muted">
            Memuat formulir lamaran...
          </section>
        </main>
        <Footer />
      </>
    )
  }

  if (!job) {
    return (
      <>
        <Header />
        <main className="bg-white">
          <CareerHero />
          <section className="py-20 text-center">
            <h2 className="text-2xl font-bold text-primary">Lowongan Tidak Ditemukan</h2>
            <p className="mt-2 text-sm text-text-muted">
              Lowongan yang Anda cari mungkin sudah ditutup atau tidak tersedia.
            </p>
            <Link
              href="/karir"
              className="mt-6 inline-flex rounded-lg bg-accent px-5 py-2.5 text-xs font-bold text-white transition hover:brightness-95"
            >
              Lihat Lowongan Lainnya
            </Link>
          </section>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <CareerHero />
        <section className="py-10 md:py-14">
          <div className="site-container">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Lamaran Posisi: {job.title}</p>
              <h1 className="mt-2 text-3xl font-extrabold text-primary md:text-4xl">Pengisian Biodata Pelamar</h1>
              <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-text-muted">
                Silakan lengkapi data diri Anda. Setelah formulir dikirim, Anda akan langsung diarahkan ke web karir untuk pengerjaan psikotes.
              </p>
            </div>
            <div className="mt-8">
              <ApplicationForm slug={job.slug} jobTitle={job.title} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
