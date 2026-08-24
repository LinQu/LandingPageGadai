'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ClipboardCheck, Landmark, ShieldCheck, Zap } from 'lucide-react'

const highlights = [
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Hanya membutuhkan waktu sekitar 30 menit untuk pencairan.',
  },
  {
    icon: ShieldCheck,
    title: 'Barang Terjaga',
    description: 'Barang tersimpan aman di gudang dan terlindungi.',
  },
  {
    icon: ClipboardCheck,
    title: 'Syarat Mudah',
    description: 'Cukup membawa KTP dan barang jaminan.',
  },
  {
    icon: Landmark,
    title: 'Berizin OJK',
    description: 'Kegiatan usaha resmi dan diawasi Otoritas Jasa Keuangan.',
  },
]

export function HeroSection() {
  return (
    <section id="beranda" className="relative overflow-hidden bg-[#dff4ff]">
      <div className="absolute right-5 top-12 h-14 w-28 rounded-full bg-white/55 blur-[1px] sm:right-16" />
      <div className="absolute -bottom-20 left-[-8%] h-44 w-[60%] rounded-[50%] bg-[#b9dc63] sm:h-52" />
      <div className="absolute -bottom-24 left-[17%] h-44 w-[60%] rounded-[50%] bg-[#8bae00] sm:h-52" />
      <div className="absolute -bottom-24 right-[-12%] h-48 w-[70%] rounded-[50%] bg-[#7d9f00] sm:h-56" />

      <div className="relative mx-auto min-h-[520px] max-w-7xl px-5 pb-8 pt-14 sm:px-6 lg:px-8 lg:pb-0 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl font-extrabold uppercase tracking-[-0.045em] text-primary sm:text-5xl lg:text-[58px] lg:leading-[1.02]">
            Gadai Sakti Indonesia
          </h1>
          <p className="mt-4 max-w-2xl text-2xl font-medium leading-snug text-primary/90 sm:text-3xl">
            Gadai Elektronik & Motor Instan,
            <br className="hidden sm:block" /> Terjamin, dan Terpercaya
          </p>
          <p className="mt-5 max-w-xl text-sm leading-6 text-slate-700 sm:text-[15px]">
            Penasaran berapa nilai barang kamu? Gunakan fitur Taksir Barang Online kami untuk mendapatkan estimasi awal nilai gadai secara online, kemudian lanjutkan proses di cabang Gadai Sakti terdekat.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/simulasi"
              className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-white shadow-md shadow-red-950/10 transition hover:bg-accent-dark"
            >
              Mulai Simulasi Gadai
              <ArrowRight size={17} />
            </Link>
            <span className="text-xs italic text-slate-600">*Estimasi awal dapat berubah setelah pemeriksaan fisik di cabang.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.18 }}
          className="relative z-10 mt-12 grid overflow-hidden rounded-xl border border-white/10 bg-primary/95 text-white shadow-xl shadow-slate-950/10 sm:grid-cols-2 lg:absolute lg:bottom-0 lg:right-8 lg:mt-0 lg:w-[610px] lg:grid-cols-4 lg:rounded-b-none"
        >
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className="border-white/10 p-4 text-center sm:border-r last:border-r-0 lg:min-h-[160px]">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/5">
                <Icon size={22} strokeWidth={1.6} />
              </div>
              <h2 className="text-sm font-semibold text-white">{title}</h2>
              <p className="mt-2 text-[11px] leading-4 text-white/72">{description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
