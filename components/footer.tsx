'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getPawnCatalog } from '@/lib/services/pawn-catalog.service'

const DEFAULT_PRODUCTS = [
  { label: 'Gadai HP', slug: 'hp' },
  { label: 'Gadai Laptop', slug: 'laptop' },
  { label: 'Gadai Kamera', slug: 'kamera' },
  { label: 'Gadai TV', slug: 'tv' },
  { label: 'Gadai Motor', slug: 'motor' },
  { label: 'Gadai Speaker', slug: 'speaker' },
]

function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43 6.27 6.27 0 0 0 1.91-4.49V8.65a8.28 8.28 0 0 0 4.82 1.55v-3.51h-1z" />
    </svg>
  )
}

function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/gadaisaktiofficial/',
    icon: InstagramIcon,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@gadaisaktiofficial',
    icon: TikTokIcon,
  },
  {
    label: 'Facebook',
    href: 'https://web.facebook.com/gadaisaktiofficial',
    icon: FacebookIcon,
  },
]

export function Footer() {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS)

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const catalog = await getPawnCatalog()
        if (!active) return

        if (Array.isArray(catalog) && catalog.length > 0) {
          const activeOnly = catalog
            .filter(cat => cat.status === 'active')
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map(cat => {
              const nameLower = cat.name.toLowerCase()
              const label = nameLower.startsWith('gadai') ? cat.name : `Gadai ${cat.name}`
              const slug = cat.kode?.toLowerCase() || cat.name.toLowerCase().replace(/\s+/g, '-')
              return { label, slug }
            })

          if (activeOnly.length > 0) {
            setProducts(activeOnly)
          }
        }
      } catch {
        // Fallback to DEFAULT_PRODUCTS
      }
    }

    void loadCategories()
    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="bg-primary text-white">
      <div className="site-container py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_1.15fr]">
          <div id="tentang-kami">
            <img src="/logo.png" alt="Gadai Sakti" className="block h-auto w-[190px] max-w-full object-contain sm:w-[210px] lg:w-[220px]" />
            <p className="mt-5 max-w-md text-xs leading-5 text-white/72">
              Gadai Sakti hadir sebagai mitra finansial yang memberikan solusi dana tunai instan dengan proses yang mudah, taksiran akurat dan kompetitif, serta jaminan keamanan penuh atas barang berharga Anda.
            </p>
            <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="flex h-8 w-20 shrink-0 items-center justify-center rounded-md bg-white px-2 py-1 shadow-sm">
                <Image
                  src="/ojk.png"
                  alt="Otoritas Jasa Keuangan"
                  width={80}
                  height={32}
                  className="h-5 w-auto object-contain"
                />
              </div>
              <span className="text-[10px] font-medium leading-tight text-white/80">
                Berizin &amp; Diawasi oleh<br />
                <strong className="font-bold text-white">Otoritas Jasa Keuangan</strong>
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Produk</h2>
            <ul className="mt-4 space-y-2 text-xs text-white/68">
              {products.map(product => (
                <li key={product.slug}>
                  <Link href={`/simulasi?kategori=${product.slug}`} className="transition-colors hover:text-white">
                    {product.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Perusahaan</h2>
            <ul className="mt-4 space-y-2 text-xs text-white/68">
              <li><Link href="/tentang-kami" className="transition-colors hover:text-white">Tentang Kami</Link></li>
              <li><Link href="/cabang" className="transition-colors hover:text-white">Lokasi Cabang</Link></li>
              <li><Link href="/artikel" className="transition-colors hover:text-white">Artikel</Link></li>
              <li><Link href="/arsip" className="transition-colors hover:text-white">Arsip</Link></li>
              <li><Link href="/karir" className="transition-colors hover:text-white">Karir</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-white">Hubungi Kami</h2>
            <div className="mt-4 space-y-3 text-xs leading-5 text-white/70">
              <p>
                <strong className="text-white">Kantor Pusat:</strong><br />
                Wisma 77 Tower 1 Lt. 5, Jl. Letjen S. Parman Kav. 77, Slipi, Palmerah, Jakarta Barat 11410
              </p>
              <p>
                <strong className="text-white">Email:</strong>{' '}
                <a href="mailto:info@gadaisakti.id" className="hover:text-white">info@gadaisakti.id</a>
              </p>
            </div>
            <h3 className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-white">Sosial Media</h3>
            <div className="mt-3 flex gap-2.5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-white/25 text-white/80 transition-all hover:border-white hover:bg-white hover:text-primary hover:scale-110 shadow-sm"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2021 PT Gadai Sakti Indonesia. All Rights Reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white">Syarat &amp; Ketentuan</a>
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
