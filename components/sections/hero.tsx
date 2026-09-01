'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ClipboardCheck, Landmark, ShieldCheck, Zap } from 'lucide-react'
import styles from './hero.module.css'

const highlights = [
  {
    icon: Zap,
    title: 'Proses Cepat',
    description: 'Taksiran dan pencairan dibuat praktis langsung di cabang.',
  },
  {
    icon: ShieldCheck,
    title: 'Barang Terjaga',
    description: 'Barang jaminan disimpan dengan prosedur keamanan yang terjaga.',
  },
  {
    icon: ClipboardCheck,
    title: 'Syarat Mudah',
    description: 'Cukup siapkan identitas dan barang jaminan untuk proses gadai.',
  },
  {
    icon: Landmark,
    title: 'Berizin OJK',
    description: 'Kegiatan usaha resmi dan diawasi Otoritas Jasa Keuangan.',
  },
]

export function HeroSection() {
  return (
    <section id="beranda" className={styles.hero}>
      <div className={styles.visual}>
        <picture className={styles.picture} aria-hidden="true">
          <source
            media="(max-width: 899px) and (orientation: landscape)"
            srcSet="/images/hero/hero-gadai-tablet.webp"
            type="image/webp"
          />
          <source
            media="(max-width: 767px) and (orientation: portrait)"
            srcSet="/images/hero/hero-gadai-mobile.webp"
            type="image/webp"
          />
          <source
            media="(max-width: 1199px)"
            srcSet="/images/hero/hero-gadai-tablet.webp"
            type="image/webp"
          />
          <img
            src="/images/hero/hero-gadai-desktop.webp"
            alt=""
            width="1920"
            height="700"
            fetchPriority="high"
            className={styles.image}
          />
        </picture>

        <div className={styles.wash} aria-hidden="true" />
        <div className={styles.mobileWash} aria-hidden="true" />

        <div className={styles.contentWrap}>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.content}
          >
            <p className={styles.eyebrow}>Solusi Gadai Cepat &amp; Terpercaya</p>
            <h1 className={styles.title}>Gadai Sakti Indonesia</h1>
            <p className={styles.subtitle}>
              Gadai Elektronik &amp; Motor Instan,
              <br className={styles.subtitleBreak} /> Terjamin, dan Terpercaya
            </p>
            <p className={styles.description}>
              Dapatkan estimasi awal nilai gadai secara online, lalu lanjutkan proses dengan pelayanan langsung di cabang Gadai Sakti terdekat.
            </p>

            <div className={styles.actions}>
              <Link href="/simulasi" className={styles.primaryCta}>
                Mulai Simulasi Gadai
                <ArrowRight size={17} />
              </Link>
              <Link href="/cabang" className={styles.secondaryCta}>
                Temukan Cabang
              </Link>
            </div>

            <p className={styles.note}>
              *Estimasi awal dapat berubah setelah pemeriksaan fisik barang di cabang.
            </p>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12 }}
        className={styles.highlights}
      >
        <div className={styles.highlightsGrid}>
          {highlights.map(({ icon: Icon, title, description }) => (
            <div key={title} className={styles.highlightItem}>
              <div className={styles.highlightIcon}>
                <Icon size={22} strokeWidth={1.6} />
              </div>
              <span className={styles.highlightAccent} />
              <h2 className={styles.highlightTitle}>{title}</h2>
              <p className={styles.highlightDescription}>{description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
