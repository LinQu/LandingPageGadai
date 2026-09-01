'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  IdCard,
  SearchCheck,
  Star,
} from 'lucide-react'
import { getAverageRating, getTestimonials } from '@/lib/services/misc.service'
import type { Testimonial } from '@/lib/types'



type AnimatedCounterProps = {
  value: number
  decimals?: number
  suffix?: string
  duration?: number
  start?: number
}

function AnimatedCounter({
  value,
  decimals = 0,
  suffix = '',
  duration = 1400,
  start = 1,
}: AnimatedCounterProps) {
  const initialValue = Math.min(start, value)
  const [displayValue, setDisplayValue] = useState(initialValue)
  const counterRef = useRef<HTMLSpanElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    const element = counterRef.current
    if (!element || hasAnimatedRef.current) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setDisplayValue(value)
      hasAnimatedRef.current = true
      return
    }

    let frameId: number | null = null

    const runAnimation = () => {
      if (hasAnimatedRef.current) return
      hasAnimatedRef.current = true

      const from = Math.min(start, value)
      const difference = value - from
      const startedAt = performance.now()

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1)
        const easedProgress = 1 - Math.pow(1 - progress, 3)
        setDisplayValue(from + difference * easedProgress)

        if (progress < 1) {
          frameId = requestAnimationFrame(tick)
        } else {
          setDisplayValue(value)
        }
      }

      frameId = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          observer.disconnect()
          runAnimation()
        }
      },
      {
        threshold: 0.45,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [duration, start, value])

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString('id-ID')
  const accessibleValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString('id-ID')

  return (
    <span ref={counterRef} aria-label={`${accessibleValue}${suffix}`}>
      <span aria-hidden="true">{formattedValue}{suffix}</span>
    </span>
  )
}

const processSteps = [
  {
    number: 1,
    icon: ClipboardList,
    title: 'Ajukan Taksiran',
    description: 'Isi form online atau hubungi tim Gadai Sakti untuk mendapatkan perkiraan taksiran awal.',
  },
  {
    number: 2,
    icon: IdCard,
    title: 'Bawa Barang & KTP',
    description: 'Kunjungi cabang Gadai Sakti terdekat dengan membawa barang jaminan dan kartu identitas.',
  },
  {
    number: 3,
    icon: SearchCheck,
    title: 'Taksir Nilai Barang',
    description: 'Tim kami memeriksa kondisi barang dan menentukan nilai taksiran secara transparan.',
  },
  {
    number: 4,
    icon: Banknote,
    title: 'Dana Cair',
    description: 'Jika nilai gadai disetujui, proses administrasi diselesaikan dan dana dapat diterima.',
  },
]

export function ProcessSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-14 text-white sm:py-16">
      <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_30%_30%,white_0,transparent_28%),radial-gradient(circle_at_75%_70%,white_0,transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">Proses Gadai</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">4 Langkah Mudah Pencairan</h2>
        </motion.div>

        <div className="relative mt-11 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div className="absolute left-[8%] right-[8%] top-9 hidden border-t border-dashed border-white/60 lg:block" />
          {processSteps.map(({ number, icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative z-10 pt-6"
            >
              <div className="absolute left-1/2 top-0 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-primary bg-accent text-white shadow-md">
                <Icon size={27} strokeWidth={1.7} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-bold text-accent shadow">
                  {number}
                </span>
              </div>
              <div className="mt-8 min-h-[168px] rounded-lg bg-white px-5 pb-5 pt-11 text-center shadow-lg shadow-slate-950/20">
                <h3 className="text-sm font-bold text-primary">{title}</h3>
                <p className="mt-3 text-xs leading-5 text-text-muted">{description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const averageRating = getAverageRating()

  useEffect(() => {
    let active = true

    async function loadTestimonials() {
      const data = await getTestimonials()
      if (!active) return
      setTestimonials(data)
      setLoading(false)
    }

    void loadTestimonials()
    return () => {
      active = false
    }
  }, [])

  const visibleTestimonials = useMemo(() => {
    if (testimonials.length === 0) return []
    return Array.from({ length: Math.min(3, testimonials.length) }, (_, offset) => {
      return testimonials[(activeIndex + offset) % testimonials.length]
    })
  }, [activeIndex, testimonials])

  const move = (direction: -1 | 1) => {
    if (testimonials.length === 0) return
    setActiveIndex(index => (index + direction + testimonials.length) % testimonials.length)
  }

  return (
    <section className="bg-[#f8f9fb] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Testimoni Nasabah</p>
          <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">Dipercaya oleh Nasabah Gadai Sakti</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-text-muted">
            Terima kasih atas kepercayaan yang telah diberikan. Ini pengalaman nyata mereka bersama Gadai Sakti Indonesia.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-slate-200 bg-white p-7 text-center shadow-lg shadow-slate-950/10 sm:p-8"
          >
            <div className="text-7xl font-bold tracking-[-0.06em] text-primary sm:text-8xl">
              <AnimatedCounter value={averageRating} decimals={1} duration={1250} />
            </div>
            <div className="mt-3 flex justify-center gap-1">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} size={28} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-text-muted">Rating Berdasarkan Ulasan Pelanggan</p>

            <div className="mt-7 grid grid-cols-3 gap-3">
              {[
                { value: 300, suffix: '+', label: 'Ulasan Google' },
                { value: 25, suffix: '+', label: 'Cabang Dinilai' },
                { value: 99, suffix: '%', label: 'Ulasan Positif' },
              ].map(stat => (
                <div key={stat.label} className="rounded-lg bg-accent px-2 py-4 text-white shadow-sm">
                  <div className="text-xl font-bold sm:text-2xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={1500} />
                  </div>
                  <div className="mt-1 text-[10px] font-medium sm:text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-950/10 sm:p-6"
          >
            <div className="mb-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Testimoni sebelumnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-primary transition hover:border-primary"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Testimoni berikutnya"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-primary transition hover:border-primary"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {loading ? (
              <div className="flex min-h-[315px] items-center justify-center text-sm text-text-muted">Memuat testimoni...</div>
            ) : (
              <div className="space-y-3">
                {visibleTestimonials.map(testimonial => (
                  <article key={testimonial.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-xs font-bold text-slate-800">{testimonial.name}</h3>
                            <p className="text-[10px] text-slate-400">{testimonial.role}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: testimonial.rating }, (_, index) => (
                              <Star key={index} size={11} className="fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-text-muted">{testimonial.content}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
