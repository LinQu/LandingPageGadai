'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const categories = [
  { name: 'Handphone', image: '/HP.png' },
  { name: 'Laptop', image: '/LPTP.png' },
  { name: 'Kamera', image: '/KAMERA.png' },
  { name: 'Televisi', image: '/TV.png' },
  { name: 'Proyektor', image: '/PROYEKTOR.png' },
  { name: 'Speaker Aktif', image: '/SPEAKER.png' },
  { name: 'Home Theater', image: '/HOME.png' },
  { name: 'Drone', image: '/DRONE.png' },
  { name: 'Motor', image: '/MTR.png' },
]

export function CategoriesSection() {
  return (
    <section className="relative overflow-hidden bg-primary py-14 text-white sm:py-16">
      <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(135deg,transparent_0%,transparent_48%,white_49%,transparent_50%,transparent_100%)] [background-size:180px_180px]" />
      <div className="site-container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          className="text-center"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/85">Layanan Kami</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Barang yang Bisa Digadaikan</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Temukan jenis barang elektronik dan kendaraan yang dapat digadaikan di Gadai Sakti dan ajukan penaksiran dengan mudah.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-wrap justify-center gap-5">
          {categories.map(({ name, image }, idx) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.045 }}
              className="group w-[145px] rounded-lg bg-white p-3 text-center shadow-lg shadow-slate-950/20 transition-transform hover:-translate-y-1 sm:w-[165px]"
            >
              <div className="flex h-24 items-center justify-center overflow-hidden rounded-md bg-slate-50 p-2 sm:h-28">
                <Image
                  src={image}
                  alt={name}
                  width={80}
                  height={80}
                  className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-20"
                />
              </div>
              <h3 className="mt-3 text-xs font-extrabold uppercase tracking-wide text-slate-900 sm:text-sm">{name}</h3>
              <Link
                href="/simulasi"
                className="mt-2 inline-flex rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-white transition-colors hover:bg-accent"
              >
                Gadaikan Sekarang
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return null
}
