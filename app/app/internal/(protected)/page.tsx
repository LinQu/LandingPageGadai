import { Archive, BrainCircuit, BriefcaseBusiness, Database, FileText, ShieldCheck, Users } from 'lucide-react'
import { queryRows } from '@/lib/internal/db'

export const dynamic = 'force-dynamic'

async function total(table: string) {
  const rows = await queryRows<{ total: number }>(`SELECT COUNT(*) AS total FROM ${table}`)
  return Number(rows[0]?.total || 0)
}

export default async function InternalDashboardPage() {
  const [articleCount, archiveCount, jobCount, applicantCount, testCount] = await Promise.all([total('articles'), total('company_archives'), total('job_positions'), total('job_applications'), total('psychotest_sets')])
  const cards = [
    { icon: FileText, label: 'Artikel', value: articleCount, text: 'Draft dan artikel publik' },
    { icon: Archive, label: 'Arsip', value: archiveCount, text: 'Dokumen perusahaan' },
    { icon: BriefcaseBusiness, label: 'Lowongan', value: jobCount, text: 'Lowongan karir' },
    { icon: Users, label: 'Pelamar', value: applicantCount, text: 'Lamaran masuk' },
    { icon: BrainCircuit, label: 'Paket Psikotes', value: testCount, text: 'Asesmen & bank soal' },
    { icon: Database, label: 'Database', value: 'MySQL', text: 'Sumber data internal' },
    { icon: ShieldCheck, label: 'Autentikasi', value: 'Session', text: 'Cookie HttpOnly + DB session' },
  ]
  return <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Gadai Sakti Internal</p><h1 className="mt-2 text-3xl font-extrabold text-primary">Dashboard Manajemen Data</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-text-muted">Kelola konten publik, lowongan, pelamar, dan asesmen psikotes pada route internal terproteksi.</p><div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({icon:Icon,label,value,text})=><div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon size={20}/></div><span className="mt-4 block text-xs font-semibold text-slate-500">{label}</span><strong className="mt-1 block text-3xl font-extrabold text-primary">{value}</strong><p className="mt-2 text-xs text-text-muted">{text}</p></div>)}</div><div className="mt-8 rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-xl font-bold text-primary">Alur rekrutmen yang disiapkan</h2><p className="mt-3 text-sm leading-6 text-text-muted">Lamaran masuk → review HR → undangan psikotes → psikotes selesai → interview HR → interview user → pemberkasan → offering → penempatan. Status tidak diubah otomatis berdasarkan skor psikotes.</p></div></div>
}
