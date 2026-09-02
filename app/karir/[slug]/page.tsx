import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock3, GraduationCap, Mail, MapPin, Share2, WalletCards, MessageCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CareerHero } from '@/components/career/career-hero'
import { RecruitmentProcess } from '@/components/career/recruitment-process'
import { getCareerJobBySlug } from '@/lib/services/career.service'

function rupiah(value?: number | null) {
  return value == null ? '-' : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
}

export default async function CareerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await getCareerJobBySlug(slug)
  if (!job) notFound()

  return (
    <>
      <Header />
      <main className="bg-white">
        <CareerHero />
        <section className="py-10 md:py-14">
          <div className="site-container">
            <h2 className="text-4xl font-extrabold text-primary md:text-5xl">{job.title}</h2>
            <div className="mt-7 grid gap-7 lg:grid-cols-[1.8fr_0.9fr]">
              <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <Section title="Deskripsi Pekerjaan"><p>{job.description}</p></Section>
                <Section title="Tanggung Jawab"><BulletList items={job.responsibilities} /></Section>
                <Section title="Kualifikasi"><BulletList items={job.qualifications} /></Section>
                <Section title="Benefit"><BulletList items={job.benefits} /></Section>
                <div className="mt-7"><RecruitmentProcess /></div>
              </article>
              <aside className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-xl font-bold text-accent">Informasi Lowongan</h3>
                  <dl className="mt-4 space-y-3 text-sm text-text-muted">
                    <Info icon={MapPin} label="Lokasi" value={`${job.locationCity}, ${job.locationProvince}`} />
                    <Info icon={Clock3} label="Tipe Pekerjaan" value={`${job.employmentType} - ${job.workMode}`} />
                    <Info icon={Clock3} label="Pengalaman" value={job.experienceLevel} />
                    <Info icon={GraduationCap} label="Pendidikan" value={job.education} />
                    <Info icon={WalletCards} label="Estimasi Gaji" value={job.salaryMin || job.salaryMax ? `${rupiah(job.salaryMin)} - ${rupiah(job.salaryMax)}` : 'Sesuai kebijakan perusahaan'} />
                  </dl>
                  <Link href={`/karir/${job.slug}/lamar`} className="mt-5 flex h-11 items-center justify-center rounded-md bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700">Lamar Sekarang</Link>
                  <button type="button" className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-slate-300 text-sm font-semibold text-primary"><Share2 size={17} /> Bagikan Lowongan</button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-primary">Butuh Bantuan?</h3>
                  <p className="mt-1 text-xs text-text-muted">Hubungi tim HR kami untuk informasi lebih lanjut.</p>
                  <div className="mt-4 space-y-3 text-xs text-text-muted">
                    <a href="https://wa.me/6281128501741" className="flex items-center gap-3"><MessageCircle size={20} className="text-emerald-600" /><span><strong className="block text-primary">WhatsApp HR</strong>0811-2850-1741</span></a>
                    <a href="mailto:hrd.rect.gadai.sakti@nusantara-sakti.com" className="flex items-center gap-3"><Mail size={20} className="text-primary" /><span><strong className="block text-primary">Email</strong>hrd.rect.gadai.sakti@nusantara-sakti.com</span></a>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mb-6"><h3 className="text-lg font-bold text-accent">{title}</h3><div className="mt-2 text-sm leading-6 text-text-muted">{children}</div></section>
}

function BulletList({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5">{items.map(item => <li key={item}>{item}</li>)}</ul>
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <div className="grid grid-cols-[22px_105px_1fr] gap-2"><Icon size={17} className="mt-0.5 text-primary" /><dt>{label}</dt><dd>: {value}</dd></div>
}
