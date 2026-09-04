'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getPawnCatalog } from '@/lib/services/pawn-catalog.service'

const FALLBACK_CATEGORY_IMAGES: Record<string, string> = {
  handphone: '/HP.png',
  hp: '/HP.png',
  smartphone: '/HP.png',
  gadget: '/HP.png',
  laptop: '/LPTP.png',
  notebook: '/LPTP.png',
  macbook: '/LPTP.png',
  kamera: '/KAMERA.png',
  camera: '/KAMERA.png',
  dslr: '/KAMERA.png',
  televisi: '/TV.png',
  tv: '/TV.png',
  'smart tv': '/TV.png',
  proyektor: '/PROYEKTOR.png',
  projector: '/PROYEKTOR.png',
  speaker: '/SPEAKER.png',
  'speaker aktif': '/SPEAKER.png',
  audio: '/SPEAKER.png',
  'home theater': '/HOME.png',
  'sound system': '/HOME.png',
  drone: '/DRONE.png',
  motor: '/MTR.png',
  'sepeda motor': '/MTR.png',
  kendaraan: '/MTR.png',
}

function resolveCategoryImage(name: string, imageUrl?: string | null): string {
  if (imageUrl && imageUrl.trim().length > 0) return imageUrl.trim()
  const key = name.toLowerCase().trim()
  if (FALLBACK_CATEGORY_IMAGES[key]) return FALLBACK_CATEGORY_IMAGES[key]
  for (const [pattern, img] of Object.entries(FALLBACK_CATEGORY_IMAGES)) {
    if (key.includes(pattern)) return img
  }
  return '/HP.png'
}

type CategoryItem = {
  id: string
  name: string
  image: string
  slug: string
}

const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: '1', name: 'Handphone', image: '/HP.png', slug: 'handphone' },
  { id: '2', name: 'Laptop', image: '/LPTP.png', slug: 'laptop' },
  { id: '3', name: 'Kamera', image: '/KAMERA.png', slug: 'kamera' },
  { id: '4', name: 'Televisi', image: '/TV.png', slug: 'televisi' },
  { id: '5', name: 'Proyektor', image: '/PROYEKTOR.png', slug: 'proyektor' },
  { id: '6', name: 'Speaker Aktif', image: '/SPEAKER.png', slug: 'speaker-aktif' },
  { id: '7', name: 'Home Theater', image: '/HOME.png', slug: 'home-theater' },
  { id: '8', name: 'Drone', image: '/DRONE.png', slug: 'drone' },
  { id: '9', name: 'Motor', image: '/MTR.png', slug: 'motor' },
]

export function CategoriesSection() {
  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES)

  useEffect(() => {
    let active = true

    async function loadDynamicCategories() {
      try {
        const catalog = await getPawnCatalog()
        if (!active) return

        if (Array.isArray(catalog) && catalog.length > 0) {
          const activeOnly = catalog
            .filter(cat => cat.status === 'active')
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map(cat => ({
              id: cat.id,
              name: cat.name,
              image: resolveCategoryImage(cat.name, cat.imageUrl),
              slug: cat.kode || cat.name.toLowerCase().replace(/\s+/g, '-'),
            }))

          if (activeOnly.length > 0) {
            setCategories(activeOnly)
          }
        }
      } catch {
        // Retain default seed categories if offline or network error occurs
      }
    }

    void loadDynamicCategories()
    return () => {
      active = false
    }
  }, [])

  const topCategories = categories.length === 9 ? categories.slice(0, 4) : categories.slice(0, Math.ceil(categories.length / 2))
  const bottomCategories = categories.length === 9 ? categories.slice(4) : categories.slice(Math.ceil(categories.length / 2))

  const renderCategoryCard = ({ id, name, image }: CategoryItem, idx: number, baseDelay = 0) => (
    <motion.div
      key={id || name}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: baseDelay + idx * 0.04 }}
      className="group flex w-[calc(50%-0.5rem)] min-w-[140px] max-w-[170px] flex-col justify-between rounded-xl border border-white/10 bg-white p-3 text-center shadow-lg shadow-slate-950/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl sm:w-[160px] sm:max-w-none md:w-[175px] lg:w-[185px] xl:w-[200px]"
    >
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-2 sm:h-28">
        <Image
          src={image}
          alt={name}
          width={90}
          height={90}
          className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-20"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between pt-2.5">
        <h3 className="line-clamp-2 min-h-[32px] text-xs font-extrabold uppercase tracking-tight text-slate-900 sm:text-sm">
          {name}
        </h3>
        <Link
          href="/simulasi"
          className="mt-2.5 inline-flex min-h-[34px] w-full items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.98] sm:text-xs"
        >
          Gadaikan Sekarang
        </Link>
      </div>
    </motion.div>
  )

  return (
    <section id="layanan" className="relative overflow-hidden bg-[#13374d] py-14 text-white sm:py-16">
      {/* Background Image Layer using public/backgroundktg.jpeg */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <Image
          src="/backgroundktg.jpeg"
          alt=""
          fill
          className="object-cover object-center"
          priority={false}
        />

        {/* Navy Gradient Overlay for high text contrast and readability */}
        <div className="absolute inset-0 bg-[#0f2c3f]/80 bg-gradient-to-b from-[#0f2c3f]/85 via-[#13374d]/75 to-[#0f2c3f]/90" />
      </div>

      <div className="site-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">Layanan Kami</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Barang yang Bisa Digadaikan</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/80">
            Temukan jenis barang elektronik dan kendaraan yang dapat digadaikan di Gadai Sakti dan ajukan penaksiran dengan mudah.
          </p>
        </motion.div>

        {/* Responsive Grid: 4 Boxes on Top Row & 5 Boxes on Bottom Row (Centered) */}
        <div className="mx-auto mt-10 flex max-w-[1240px] flex-col items-center gap-3.5 sm:gap-4 lg:gap-5">
          {/* Top Row: 4 Boxes Centered */}
          <div className="flex w-full flex-wrap justify-center gap-3.5 sm:gap-4 lg:gap-5">
            {topCategories.map((item, idx) => renderCategoryCard(item, idx, 0))}
          </div>

          {/* Bottom Row: 5 Boxes Centered */}
          {bottomCategories.length > 0 && (
            <div className="flex w-full flex-wrap justify-center gap-3.5 sm:gap-4 lg:gap-5">
              {bottomCategories.map((item, idx) => renderCategoryCard(item, idx, 0.16))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return null
}

