'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { label: 'Simulasi', href: '/simulasi' },
    { label: 'Cek Status Gadai', href: '/cek-status-gadai' },
    { label: 'Arsip', href: '/arsip' },
    { label: 'Artikel', href: '/artikel' },
    { label: 'Cabang', href: '/cabang' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 bg-primary`}
    >
      <nav className="bg-primary max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <img src="/logo.png" alt="Gadai Sakti" className="h-8 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-white">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm text-white font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-white'
                    : 'text-text-main hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/simulasi"
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              Mulai Simulasi
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-primary hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-text-main hover:bg-bg-light rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/simulasi"
              className="block px-4 py-2 bg-primary text-white rounded-lg text-center font-medium hover:bg-primary-dark transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Mulai Simulasi
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
