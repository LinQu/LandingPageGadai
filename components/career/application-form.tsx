'use client'

import { FormEvent, useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

const provinces = ['Banten', 'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'D.I. Yogyakarta', 'Jawa Timur', 'Sulawesi Selatan']

export function ApplicationForm({ slug, jobTitle }: { slug: string; jobTitle: string }) {
  const [form, setForm] = useState({ fullName: '', province: '', city: '', phone: '', email: '', consent: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/careers/${encodeURIComponent(slug)}/apply`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Lamaran belum dapat dikirim.')
      setCode(payload.applicationCode)
    } catch (error: any) {
      setMessage(error.message || 'Lamaran belum dapat dikirim.')
    } finally {
      setSaving(false)
    }
  }

  if (code) return (
    <div className="mx-auto max-w-4xl rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
      <h2 className="mt-4 text-2xl font-extrabold text-primary">Lamaran Berhasil Dikirim</h2>
      <p className="mt-2 text-sm text-text-muted">Tim HR akan meninjau lamaran untuk posisi <strong>{jobTitle}</strong>. Jika dilanjutkan ke psikotes, kandidat akan menerima tautan asesmen dari HR.</p>
      <div className="mx-auto mt-5 max-w-sm rounded-lg border border-emerald-200 bg-white px-4 py-3"><span className="block text-xs text-slate-500">Kode Lamaran</span><strong className="text-lg tracking-wide text-primary">{code}</strong></div>
      <p className="mt-4 text-xs text-slate-500">Simpan kode ini untuk referensi komunikasi dengan HR.</p>
    </div>
  )

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
      <div className="grid gap-5">
        <label className="text-sm font-medium text-slate-800">Nama Lengkap
          <input required value={form.fullName} onChange={e => setForm(v => ({ ...v, fullName: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-400 px-4 outline-none focus:border-primary" />
        </label>
        <div>
          <span className="text-sm font-medium text-slate-800">Domisili</span>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <select required value={form.province} onChange={e => setForm(v => ({ ...v, province: e.target.value }))} className="h-12 rounded-xl border border-slate-400 px-4 outline-none focus:border-primary">
              <option value="">Provinsi</option>{provinces.map(item => <option key={item}>{item}</option>)}
            </select>
            <input required placeholder="Kota / Kabupaten" value={form.city} onChange={e => setForm(v => ({ ...v, city: e.target.value }))} className="h-12 rounded-xl border border-slate-400 px-4 outline-none focus:border-primary" />
          </div>
        </div>
        <label className="text-sm font-medium text-slate-800">Nomor Telepon
          <input required inputMode="tel" value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-400 px-4 outline-none focus:border-primary" />
        </label>
        <label className="text-sm font-medium text-slate-800">Email
          <input required type="email" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} className="mt-2 h-12 w-full rounded-xl border border-slate-400 px-4 outline-none focus:border-primary" />
        </label>
        <label className="flex items-start gap-3 text-xs leading-5 text-text-muted">
          <input required type="checkbox" checked={form.consent} onChange={e => setForm(v => ({ ...v, consent: e.target.checked }))} className="mt-1" />
          <span>Saya menyetujui data lamaran digunakan oleh tim rekrutmen untuk proses seleksi posisi ini dan komunikasi terkait tahapan rekrutmen.</span>
        </label>
        {message ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p> : null}
        <button disabled={saving} className="mx-auto flex h-11 min-w-64 items-center justify-center gap-2 rounded-lg bg-red-600 px-8 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">
          {saving ? <Loader2 size={17} className="animate-spin" /> : null} Kirim Formulir
        </button>
      </div>
    </form>
  )
}
