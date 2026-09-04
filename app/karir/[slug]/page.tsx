'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Clock3,
  GraduationCap,
  Mail,
  MapPin,
  Share2,
  WalletCards,
  MessageCircle,
  Check,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CareerHero } from '@/components/career/career-hero'
import { RecruitmentProcess } from '@/components/career/recruitment-process'
import { formatLocationName, formatPlacement } from '@/lib/utils/format-location'
import { getCareerJobBySlug } from '@/lib/services/career.service'
import type { CareerJob } from '@/lib/types'

function rupiah(value?: number | null) {
  return value == null
    ? '-'
    : new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(value)
}

export default function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [job, setJob] = useState<CareerJob | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

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

  const handleShare = async () => {
    if (typeof window === 'undefined') return

    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: job?.title ? `${job.title} - Karir Gadai Sakti` : 'Karir Gadai Sakti',
          url,
        })
        return
      } catch {
        // Fallback to clipboard if share was canceled or failed
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignored
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="bg-white">
          <CareerHero />
          <section className="py-20 text-center text-sm text-text-muted">
            Memuat detail lowongan...
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
            <h1 className="text-4xl font-extrabold text-primary md:text-5xl">{job.title}</h1>
            <div className="mt-7 grid gap-7 lg:grid-cols-[1.8fr_0.9fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <Section title="Deskripsi Pekerjaan">
                  <p>{job.description}</p>
                </Section>
                <Section title="Tanggung Jawab">
                  <BulletList items={job.responsibilities} />
                </Section>
                <Section title="Kualifikasi">
                  <BulletList items={job.qualifications} />
                </Section>
                <Section title="Benefit">
                  <BulletList items={job.benefits} />
                </Section>
                <div className="mt-7">
                  <RecruitmentProcess />
                </div>
              </article>

              <aside className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xl font-bold text-accent">Informasi Lowongan</h3>
                  <dl className="mt-4 space-y-3 text-sm text-text-muted">
                    <Info
                      icon={MapPin}
                      label="Penempatan"
                      value={`${formatPlacement(job.locationCity, job.placementDetail)}, ${formatLocationName(job.locationProvince)}`}
                    />
                    <Info
                      icon={Clock3}
                      label="Tipe Pekerjaan"
                      value={`${job.employmentType} - ${job.workMode}`}
                    />
                    <Info icon={Clock3} label="Pengalaman" value={job.experienceLevel} />
                    <Info icon={GraduationCap} label="Pendidikan" value={job.education} />
                    <Info
                      icon={WalletCards}
                      label="Estimasi Gaji"
                      value={
                        job.salaryMin || job.salaryMax
                          ? `${rupiah(job.salaryMin)} - ${rupiah(job.salaryMax)}`
                          : 'Sesuai kebijakan perusahaan'
                      }
                    />
                  </dl>

                  <Link
                    href={`/karir/${job.slug}/lamar`}
                    className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 shadow-sm"
                  >
                    Lamar Sekarang
                  </Link>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-primary transition hover:bg-slate-50"
                  >
                    {copied ? (
                      <>
                        <Check size={17} className="text-emerald-600" />
                        <span className="text-emerald-600">Link Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 size={17} />
                        <span>Bagikan Lowongan</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-primary">Butuh Bantuan?</h3>
                  <p className="mt-1 text-xs text-text-muted">
                    Hubungi tim HR kami untuk informasi lebih lanjut.
                  </p>
                  <div className="mt-4 space-y-3 text-xs text-text-muted">
                    <a
                      href="https://wa.me/6281128501741"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 transition hover:text-primary"
                    >
                      <MessageCircle size={20} className="text-emerald-600 shrink-0" />
                      <span>
                        <strong className="block text-primary">WhatsApp HR</strong>
                        0811-2850-1741
                      </span>
                    </a>
                    <a
                      href="mailto:hrd.rect.gadai.sakti@nusantara-sakti.com"
                      className="flex items-center gap-3 transition hover:text-primary"
                    >
                      <Mail size={20} className="text-primary shrink-0" />
                      <span className="break-all">
                        <strong className="block text-primary">Email</strong>
                        hrd.rect.gadai.sakti@nusantara-sakti.com
                      </span>
                    </a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="text-lg font-bold text-accent">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-text-muted">{children}</div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-text-muted">-</p>
  }
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[22px_105px_1fr] gap-2 items-start">
      <Icon size={17} className="mt-0.5 text-primary shrink-0" />
      <dt>{label}</dt>
      <dd>: {value}</dd>
    </div>
  )
}
