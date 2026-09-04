import Link from 'next/link'
import { BarChart3, Bolt, FileText, ShieldCheck, Store, BadgeCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PawnCta } from '@/components/company/pawn-cta'
import { AboutOverview } from '@/components/company/about-overview'
import { ArchivePreview } from '@/components/company/archive-preview'

const reasons = [
  { icon: Bolt, title: 'Proses Cepat', text: 'Pemeriksaan dibuat ringkas agar kebutuhan dana dapat diproses secara efisien.' },
  { icon: ShieldCheck, title: 'Aman & Terpercaya', text: 'Proses dan informasi transaksi dibuat jelas untuk membantu pelanggan mengambil keputusan.' },
  { icon: BarChart3, title: 'Taksiran Kompetitif', text: 'Penaksiran mempertimbangkan kondisi, spesifikasi, umur, dan nilai pasar barang.' },
  { icon: BadgeCheck, title: 'Tanpa BI Checking', text: 'Proses gadai berfokus pada barang jaminan sesuai ketentuan yang berlaku.' },
]

const timeline = [
  { year: '2020', title: 'Mulai operasional', text: 'Perjalanan layanan Gadai Sakti dimulai dan terus dikembangkan.' },
  { year: '2023', title: 'Perluasan layanan', text: 'Jangkauan cabang dan kategori layanan mulai diperluas.' },
  { year: '2025', title: 'Penguatan layanan', text: 'Pengalaman digital dan layanan cabang dikembangkan lebih terintegrasi.' },
  { year: '2026', title: 'Menuju layanan nasional', text: 'Fokus pada standardisasi layanan, transparansi, dan kemudahan akses.' },
]

export default function TentangKamiPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <AboutOverview />

        <section className="border-y border-slate-100 bg-slate-50/50 py-10 md:py-14">
          <div className="site-container">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-primary">Mengapa Memilih Kami?</h2>
              <div className="mx-auto mt-2.5 h-1 w-14 rounded-full bg-accent" />
            </div>
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map(({ icon: Icon, title, text }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent"><Icon size={30} /></div>
                  <h3 className="mt-4 text-base font-bold text-primary">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <h2 className="text-3xl font-extrabold text-primary">Perjalanan Kami</h2>
              <div className="mx-auto mt-2.5 h-1 w-14 rounded-full bg-accent" />
            </div>
            <div className="relative mt-10 grid gap-6 md:grid-cols-4 before:absolute before:left-[12%] before:right-[12%] before:top-5 before:hidden before:h-px before:bg-primary/35 md:before:block">
              {timeline.map((item, index) => (
                <div key={item.year} className="relative text-center">
                  <div className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white ${index % 2 ? 'bg-accent' : 'bg-primary'}`}>{index % 2 ? <Store size={19} /> : <FileText size={19} />}</div>
                  <strong className="mt-3 block text-sm text-primary">{item.year}</strong>
                  <h3 className="mt-1 text-sm font-bold text-primary">{item.title}</h3>
                  <p className="mx-auto mt-1 max-w-[210px] text-[11px] leading-4 text-text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14">
          <div className="site-container">
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Publikasi</p><h2 className="mt-1 text-3xl font-extrabold text-primary">Arsip</h2></div><Link href="/arsip" className="text-sm font-bold text-primary hover:text-accent">Lihat semua arsip</Link></div>
            <ArchivePreview />
            <div className="mt-10"><PawnCta /></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
