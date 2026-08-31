'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ClipboardCheck, Landmark, ShieldCheck, Zap } from 'lucide-react'

const highlights = [
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Proses taksiran dan pencairan dibuat praktis di cabang.',
  },
  {
    icon: ShieldCheck,
    title: 'Barang Terjaga',
    description: 'Barang jaminan disimpan dengan prosedur keamanan.',
  },
  {
    icon: ClipboardCheck,
    title: 'Syarat Mudah',
    description: 'Siapkan identitas dan barang jaminan untuk proses gadai.',
  },
  {
    icon: Landmark,
    title: 'Berizin OJK',
    description: 'Kegiatan usaha resmi dan diawasi Otoritas Jasa Keuangan.',
  },
]

export function HeroSection() {
  return (
    <section id="beranda" className="overflow-hidden bg-white">
      <div className="relative isolate min-h-[650px] overflow-hidden md:min-h-[500px] lg:aspect-[1920/700] lg:min-h-[520px] lg:max-h-[700px]">
        <picture className="absolute inset-0 block h-full w-full" aria-hidden="true">
          <source media="(max-width: 767px)" srcSet="/images/hero/hero-gadai-mobile.webp" type="image/webp" />
          <source media="(max-width: 1023px)" srcSet="/images/hero/hero-gadai-tablet.webp" type="image/webp" />
          <img
            src="/images/hero/hero-gadai-desktop.webp"
            alt=""
            width="1920"
            height="700"
            fetchPriority="high"
            className="h-full w-full object-cover object-[55%_top] md:object-center 2xl:object-contain 2xl:object-right"
          />
        </picture>

        {/*
          Mobile image is composed vertically with the operational visual at the top
          and clear space below. Tablet/desktop use a horizontal composition with
          clear space on the left, so the gradient direction changes by breakpoint.
        */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/5 to-white/95 md:bg-gradient-to-r md:from-white/95 md:via-white/75 md:to-white/0" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_68%,rgba(255,255,255,0.78)_100%)] md:hidden" />

        <div className="relative mx-auto flex h-full min-h-[650px] max-w-7xl items-end px-5 pb-9 pt-[300px] sm:px-6 md:min-h-[500px] md:items-center md:py-10 lg:min-h-[520px] lg:px-8 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[560px] rounded-2xl border border-white/70 bg-white/[0.90] p-5 shadow-lg shadow-slate-900/5 backdrop-blur-[2px] md:max-w-[48%] md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:backdrop-blur-none lg:max-w-[570px]"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-accent sm:text-xs">
              Solusi Gadai Cepat & Terpercaya
            </p>

            <h1 className="text-[34px] font-extrabold uppercase leading-[1.04] tracking-[-0.045em] text-primary sm:text-[36px] md:text-[42px] lg:text-[52px] xl:text-[58px]">
              Gadai Sakti Indonesia
            </h1>

            <p className="mt-3 text-[19px] font-semibold leading-snug text-primary/90 sm:text-[20px] md:text-[22px] lg:text-[27px]">
              Gadai Elektronik & Motor Instan,
              <br className="hidden md:block" /> Terjamin, dan Terpercaya
            </p>

            <p className="mt-4 max-w-[520px] text-[13px] leading-6 text-slate-700 sm:text-[12px] md:text-[13px] lg:text-[14px]">
              Dapatkan estimasi awal nilai gadai secara online, lalu lanjutkan proses dengan pelayanan langsung di cabang Gadai Sakti terdekat.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6">
              <Link
                href="/simulasi"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-950/10 transition hover:bg-accent-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Mulai Simulasi Gadai
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/cabang"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-primary/30 bg-white/80 px-5 py-2.5 text-sm font-semibold text-primary backdrop-blur-sm transition hover:border-primary hover:bg-white"
              >
                Temukan Cabang
              </Link>
            </div>

            <p className="mt-3 max-w-md text-[10px] italic leading-4 text-slate-500 sm:text-[11px]">
              *Estimasi awal dapat berubah setelah pemeriksaan fisik barang di cabang.
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className="relative z-10 bg-primary text-white shadow-[0_-8px_30px_rgba(15,23,42,0.08)]"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 px-3 sm:px-6 md:grid-cols-4 lg:px-8">
          {highlights.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              className={`flex min-h-[112px] items-start gap-3 px-3 py-4 sm:min-h-[126px] sm:px-4 sm:py-5 md:items-center md:border-l md:border-white/10 md:first:border-l-0 lg:px-5 ${
                index < 2 ? 'border-b border-white/10 md:border-b-0' : ''
              } ${index % 2 === 1 ? 'border-l border-white/10' : ''}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/5 sm:h-11 sm:w-11">
                <Icon size={20} strokeWidth={1.7} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-white sm:text-sm">{title}</h2>
                <p className="mt-1 hidden text-[10px] leading-4 text-white/70 sm:block lg:text-[11px]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
