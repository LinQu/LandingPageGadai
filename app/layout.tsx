import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import Script from 'next/script'
import { FloatingHelp } from '@/components/floating-help'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins-next',
})

export const metadata: Metadata = {
  title: 'Gadai Sakti — Gadai Elektronik & Motor Aman, Cepat & Terpercaya | Berizin OJK',
  description: 'PT Gadai Sakti Nusantara melayani gadai hp, laptop, kamera, drone, TV, dan sepeda motor dengan proses super cepat, taksiran tertinggi hingga 90%, aman diasuransikan, dan resmi berizin OJK.',
  keywords: 'gadai sakti, gadai elektronik, gadai hp, gadai laptop, gadai motor, tempat gadai terdekat, pinjaman dana cepat, gadai ojk',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#13374d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-bg-light">
        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {children}
        <FloatingHelp />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
