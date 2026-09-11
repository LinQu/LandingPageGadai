'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import styles from './hero.module.css'

export function HeroSection() {
  return (
    <section id="beranda" className={styles.hero}>
      <div className={styles.visual}>
        <picture className={styles.picture} aria-hidden="true">
          <source
            media="(max-width: 899px) and (orientation: landscape)"
            srcSet="/images/hero/hero-gadai-tablet.png"
            type="image/png"
          />
          <source
            media="(max-width: 767px) and (orientation: portrait)"
            srcSet="/images/hero/hero-gadai-mobile.png"
            type="image/png"
          />
          <source
            media="(max-width: 1199px)"
            srcSet="/images/hero/hero-gadai-tablet.png"
            type="image/png"
          />
          <img
            src="/images/hero/hero-gadai-desktop.png"
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

            <div className={styles.actions}>
              <Link href="#layanan" className={styles.primaryCta}>
                Cek Barang Gadai
                <ArrowRight size={18} />
              </Link>
              <Link href="/cabang" className={styles.secondaryCta}>
                Temukan Cabang
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
