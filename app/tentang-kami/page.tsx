import Link from 'next/link'
import { BarChart3, Bolt, FileText, ShieldCheck, Store, Users, BadgeCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PawnCta } from '@/components/company/pawn-cta'
import { StorefrontIllustration } from '@/components/company/storefront-illustration'
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
        <section className="py-10 md:py-14">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Tentang Gadai Sakti</p>
              <h1 className="mt-2 max-w-2xl text-4xl font-extrabold leading-[1.08] text-primary md:text-5xl">Solusi Dana Cepat dengan Jaminan Barang Elektronik dan Motor</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-text-muted">Gadai Sakti hadir sebagai solusi keuangan berbasis gadai untuk membantu masyarakat mendapatkan dana dengan proses yang mudah dipahami. Kami mengutamakan transparansi, keamanan barang jaminan, dan layanan yang responsif di cabang.</p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted">Komitmen kami adalah membangun pengalaman gadai yang praktis dan bertanggung jawab, dengan informasi taksiran dan ketentuan yang disampaikan secara jelas sebelum transaksi dilanjutkan.</p>
              <div className="mt-5 inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <span className="text-xl font-extrabold text-accent">OJK</span>
                <span className="text-[11px] leading-4 text-text-muted">Informasi legalitas dan nomor izin dapat ditempatkan di sini sesuai data resmi perusahaan.</span>
              </div>
            </div>
            <StorefrontIllustration />
          </div>

          <div className="mx-auto mt-8 max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="grid overflow-hidden rounded-xl bg-primary text-white md:grid-cols-3">
              {[
                { icon: Store, value: '20+', label: 'Cabang Aktif' },
                { icon: BadgeCheck, value: '20+', label: 'Rating / Cabang Dinilai' },
                { icon: Users, value: '99,999+', label: 'Nasabah Dilayani' },
              ].map(({ icon: Icon, value, label }, index) => (
                <div key={label} className={`flex items-center justify-center gap-4 px-6 py-5 ${index ? 'border-t border-white/15 md:border-l md:border-t-0' : ''}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Icon size={24} /></div>
                  <div><strong className="block text-3xl font-extrabold">{value}</strong><span className="text-xs text-white/70">{label}</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/50 py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <div className="text-center"><h2 className="text-3xl font-extrabold text-primary">Mengapa <span className="border-b-2 border-accent pb-1">Memilih</span> Kami?</h2></div>
            <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {reasons.map(({ icon: Icon, title, text }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent"><Icon size={30} /></div>
                  <h3 className="mt-4 text-base font-bold text-primary">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center"><h2 className="text-3xl font-extrabold text-primary">Perjalanan <span className="border-b-2 border-accent pb-1">Kami</span></h2></div>
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
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
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
