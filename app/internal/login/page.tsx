'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

export default function InternalLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/internal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Login gagal.')
      router.replace('/internal')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-primary px-7 py-7 text-white">
          <img src="/logo.png" alt="Gadai Sakti" className="block h-auto w-[235px] max-w-full object-contain" />
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/80"><ShieldCheck size={18} /> Area Internal</div>
          <h1 className="mt-2 text-3xl font-extrabold text-white">Login Manajemen Data</h1>
          <p className="mt-2 text-xs leading-5 text-white/65">Halaman ini terpisah dari website publik dan menggunakan sesi server berbasis MySQL.</p>
        </div>
        <form onSubmit={submit} className="space-y-5 p-7">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Email</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-primary">
              <Mail size={17} className="text-slate-400" />
              <input type="email" required value={email} onChange={event => setEmail(event.target.value)} className="h-11 w-full bg-transparent text-sm outline-none" placeholder="admin@gadaisakti.id" autoComplete="username" />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Password</span>
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-primary">
              <LockKeyhole size={17} className="text-slate-400" />
              <input type="password" required value={password} onChange={event => setPassword(event.target.value)} className="h-11 w-full bg-transparent text-sm outline-none" placeholder="Minimal 10 karakter" autoComplete="current-password" />
            </div>
          </label>
          {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-700">{error}</div> : null}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark disabled:opacity-50">{loading ? 'Memverifikasi...' : 'Masuk ke Internal'}</button>
          <p className="text-[11px] leading-5 text-slate-500">Sebelum login pertama, siapkan MySQL, jalankan schema, lalu buat akun admin dengan script yang disediakan di <code>INTERNAL-SETUP.md</code>.</p>
        </form>
      </div>
    </main>
  )
}
