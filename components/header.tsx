'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Lokasi Cabang', href: '/cabang' },
  { label: 'Artikel', href: '/artikel' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
  { label: 'Karir', href: '/karir' },
]

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href.startsWith('/#')) return false
    return pathname.startsWith(href)
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-primary text-white transition-shadow duration-300 ${
        isScrolled ? 'shadow-lg shadow-slate-950/10' : ''
      }`}
    >
      <nav className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Gadai Sakti - Beranda">
          <img
            src="/logo.png"
            alt="Gadai Sakti"
            className="block h-auto w-[180px] object-contain sm:w-[205px] lg:w-[225px] xl:w-[240px]"
          />
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navItems.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative py-2 text-sm font-medium text-white/85 transition-colors hover:text-white ${
                isActive(item.href)
                  ? 'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-white'
                  : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/simulasi"
            className="rounded-md border border-white/35 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-primary"
          >
            Simulasi Gadai
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(open => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/10 lg:hidden"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/10 bg-primary px-5 pb-5 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 pt-3">
            {navItems.map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/simulasi"
              onClick={() => setIsOpen(false)}
              className="mt-2 rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Simulasi Gadai
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
