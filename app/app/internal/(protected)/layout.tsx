import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Archive, BrainCircuit, BriefcaseBusiness, FileText, LayoutDashboard, PackageSearch, Wrench } from 'lucide-react'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { LogoutButton } from '@/components/internal/logout-button'

export const dynamic = 'force-dynamic'

const menu = [
  { href: '/internal', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/internal/artikel', label: 'Artikel', icon: FileText },
  { href: '/internal/arsip', label: 'Arsip', icon: Archive },
  { href: '/internal/karir', label: 'Karir & Pelamar', icon: BriefcaseBusiness },
  { href: '/internal/psikotes', label: 'Psikotes', icon: BrainCircuit },
  { href: '/internal/barang', label: 'Master Barang', icon: PackageSearch },
  { href: '/internal/tools', label: 'Tools', icon: Wrench },
]

export default async function InternalProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin()
  if (!admin) redirect('/internal/login')

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-primary p-5 text-white lg:min-h-screen">
        <Link href="/" className="inline-block"><img src="/logo.png" alt="Gadai Sakti" className="h-8 w-auto" /></Link>
        <div className="mt-7 rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/50">Login sebagai</p><strong className="mt-1 block text-sm">{admin.name}</strong><span className="text-[11px] text-white/60">{admin.email}</span><span className="mt-2 inline-flex rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/70">{admin.role}</span>
        </div>
        <nav className="mt-6 space-y-1">{menu.map(({href,label,icon:Icon})=><Link key={href} href={href} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"><Icon size={18}/>{label}</Link>)}</nav>
        <div className="mt-7 border-t border-white/10 pt-4"><LogoutButton /></div>
      </aside>
      <main className="min-w-0 p-5 md:p-8 lg:p-10">{children}</main>
    </div>
  )
}
