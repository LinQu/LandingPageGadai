import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock3, GraduationCap, MapPin } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CareerHero } from '@/components/career/career-hero'
import { getCareerJobs } from '@/lib/services/career.service'

const PAGE_SIZE = 12

type SearchParams = Promise<{ position?: string; location?: string; education?: string; page?: string }>

export default async function CareerPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const jobs = await getCareerJobs()
  const position = String(params.position || '')
  const location = String(params.location || '')
  const education = String(params.education || '')
  const currentPage = Math.max(1, Number(params.page || 1) || 1)

  const positions = Array.from(new Set(jobs.map(job => job.title))).sort()
  const locations = Array.from(new Set(jobs.map(job => `${job.locationCity}, ${job.locationProvince}`))).sort()
  const educations = Array.from(new Set(jobs.map(job => job.education))).sort()
  const filtered = jobs.filter(job => {
    const place = `${job.locationCity}, ${job.locationProvince}`
    return (!position || job.title === position) && (!location || place === location) && (!education || job.education === education)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(currentPage, totalPages)
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const pageHref = (number: number) => {
    const q = new URLSearchParams()
    if (position) q.set('position', position)
    if (location) q.set('location', location)
    if (education) q.set('education', education)
    q.set('page', String(number))
    return `/karir?${q.toString()}`
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <CareerHero />
        <section className="relative z-10 -mt-12 pb-12 md:-mt-11 md:pb-16">
          <div className="site-container">
            <form className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
              <label className="text-xs font-semibold text-primary">Nama Posisi
                <select name="position" defaultValue={position} className="mt-1 input-internal">
                  <option value="">Semua Posisi</option>{positions.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-primary">Lokasi Penempatan
                <select name="location" defaultValue={location} className="mt-1 input-internal">
                  <option value="">Semua Lokasi</option>{locations.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-primary">Pendidikan
                <select name="education" defaultValue={education} className="mt-1 input-internal">
                  <option value="">Semua Pendidikan</option>{educations.map(item => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button className="h-11 rounded-lg bg-accent px-6 text-sm font-bold text-white hover:bg-accent-dark">Cari</button>
              <Link href="/karir" className="flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-bold text-primary hover:bg-slate-50">Reset</Link>
            </form>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map(job => (
                <article key={job.id} className="flex min-h-[230px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <h2 className="text-xl font-extrabold text-primary">{job.title}</h2>
                  <div className="mt-3 space-y-2 text-sm text-text-muted">
                    <p className="flex items-center gap-2"><MapPin size={16} className="text-accent" /><span><strong className="font-semibold text-accent">Penempatan:</strong> {job.locationCity}</span></p>
                    <p className="flex items-center gap-2"><Clock3 size={16} className="text-primary" /><span><strong className="font-medium">Pengalaman:</strong> {job.experienceLevel}</span></p>
                    <p className="flex items-center gap-2"><GraduationCap size={16} className="text-primary" /><span><strong className="font-medium">Pendidikan:</strong> {job.education}</span></p>
                  </div>
                  <div className="mt-auto pt-6 text-right"><Link href={`/karir/${job.slug}`} className="inline-flex rounded-md bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700">Detail Lowongan</Link></div>
                </article>
              ))}
            </div>
            {!visible.length ? <div className="mt-8 rounded-xl border border-dashed border-slate-300 py-16 text-center text-sm text-text-muted">Belum ada lowongan yang sesuai filter.</div> : null}

            {filtered.length > 0 ? (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Link aria-disabled={page === 1} href={pageHref(Math.max(1, page - 1))} className={`flex h-9 w-9 items-center justify-center rounded border border-slate-300 ${page === 1 ? 'pointer-events-none opacity-30' : 'text-primary'}`}><ArrowLeft size={16} /></Link>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => <Link key={number} href={pageHref(number)} className={`flex h-9 min-w-9 items-center justify-center rounded px-2 text-sm font-semibold ${number === page ? 'bg-primary text-white' : 'text-primary hover:bg-slate-100'}`}>{number}</Link>)}
                <Link aria-disabled={page === totalPages} href={pageHref(Math.min(totalPages, page + 1))} className={`flex h-9 w-9 items-center justify-center rounded border border-slate-300 ${page === totalPages ? 'pointer-events-none opacity-30' : 'text-primary'}`}><ArrowRight size={16} /></Link>
              </div>
            ) : null}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
