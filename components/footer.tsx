import Image from 'next/image'
import Link from 'next/link'
import { Camera, Play, Users } from 'lucide-react'

const products = [
  'Gadai Handphone',
  'Gadai Laptop',
  'Gadai Kamera',
  'Gadai TV',
  'Gadai Drone',
  'Gadai Speaker',
  'Gadai Home Theater',
  'Gadai Proyektor',
  'Gadai Motor',
]

export function Footer() {
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
                <li key={product}>
                  <Link href="/simulasi" className="transition-colors hover:text-white">{product}</Link>
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
            <div className="mt-3 flex gap-2">
              {[
                { label: 'Instagram', icon: Camera },
                { label: 'YouTube', icon: Play },
                { label: 'Facebook', icon: Users },
              ].map(({ label, icon: Icon }) => (
                <a key={label} href="#" aria-label={label} className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 text-white/80 transition hover:bg-white hover:text-primary">
                  <Icon size={15} />
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
