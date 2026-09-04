'use client'

import { FormEvent, useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react'
import { AutocompleteInput } from '@/components/ui/autocomplete-input'
import { getCitySuggestions, getProvinceSuggestions } from '@/lib/utils/indonesia-regions'

export function ApplicationForm({ slug, jobTitle }: { slug: string; jobTitle: string }) {
  const [form, setForm] = useState({ fullName: '', province: '', city: '', phone: '', email: '', consent: false })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [code, setCode] = useState('')
  const [targetUrl, setTargetUrl] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/careers/${encodeURIComponent(slug)}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Biodata belum dapat dikirim.')
      setCode(payload.applicationCode)
      const url = payload.targetUrl || '/karir'
      setTargetUrl(url)

      // Directly redirect to the psychotest / career web URL
      if (typeof window !== 'undefined' && url) {
        setTimeout(() => {
          window.location.href = url
        }, 800)
      }
    } catch (error: any) {
      setMessage(error.message || 'Biodata belum dapat dikirim.')
    } finally {
      setSaving(false)
    }
  }

  if (code && targetUrl) return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-emerald-50/80 p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
      <h2 className="mt-4 text-2xl font-extrabold text-primary">Biodata Berhasil Disimpan!</h2>
      <p className="mt-2 text-sm text-text-muted">
        Lamaran untuk posisi <strong>{jobTitle}</strong> telah terdata. Sedang mengarahkan Anda ke web pengerjaan psikotes...
      </p>
      <div className="mx-auto mt-5 max-w-sm rounded-xl border border-emerald-200 bg-white px-5 py-3 shadow-xs">
        <span className="block text-xs text-slate-500 font-medium">Kode Lamaran</span>
        <strong className="text-lg tracking-wide text-primary">{code}</strong>
      </div>
      <div className="mt-7 flex flex-col items-center justify-center gap-3">
        <a
          href={targetUrl}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-8 text-sm font-bold text-white shadow-md transition hover:bg-accent-dark hover:shadow-lg"
        >
          <span>Lanjut ke Pengerjaan Psikotes Sekarang</span>
          <ArrowRight size={18} />
        </a>
        <p className="text-xs text-slate-500">
          Jika halaman tidak terbuka secara otomatis dalam beberapa detik, klik tombol di atas.
        </p>
      </div>
    </div>
  )

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
      <div className="grid gap-5">
        <label className="text-sm font-semibold text-primary">
          Nama Lengkap <span className="text-accent">*</span>
          <input
            required
            placeholder="Masukkan nama lengkap sesuai KTP"
            value={form.fullName}
            onChange={e => setForm(v => ({ ...v, fullName: e.target.value }))}
            className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </label>

        <div>
          <span className="text-sm font-semibold text-primary">
            Domisili <span className="text-accent">*</span>
          </span>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-500">Provinsi</span>
              <AutocompleteInput
                required
                placeholder="Pilih atau ketik Provinsi"
                value={form.province}
                onChange={val => setForm(v => ({ ...v, province: val, city: '' }))}
                getSuggestions={getProvinceSuggestions}
                className="h-12 text-sm rounded-xl border-slate-300"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-medium text-slate-500">Kota / Kabupaten</span>
              <AutocompleteInput
                required
                placeholder="Pilih Kota / Kabupaten"
                value={form.city}
                onChange={val => setForm(v => ({ ...v, city: val }))}
                getSuggestions={query => getCitySuggestions(form.province, query)}
                className="h-12 text-sm rounded-xl border-slate-300"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-primary">
            Nomor WhatsApp / HP <span className="text-accent">*</span>
            <input
              required
              type="tel"
              placeholder="Contoh: 081234567890"
              value={form.phone}
              onChange={e => setForm(v => ({ ...v, phone: e.target.value }))}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>

          <label className="text-sm font-semibold text-primary">
            Email Aktif <span className="text-accent">*</span>
            <input
              required
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={e => setForm(v => ({ ...v, email: e.target.value }))}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </label>
        </div>

        <label className="mt-2 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-xs leading-5 text-text-muted cursor-pointer hover:bg-slate-50">
          <input
            required
            type="checkbox"
            checked={form.consent}
            onChange={e => setForm(v => ({ ...v, consent: e.target.checked }))}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>
            Saya menyatakan bahwa data yang diisi adalah benar dan menyetujui data digunakan oleh tim rekrutmen untuk proses seleksi serta komunikasi tahapan asesmen/psikotes.
          </span>
        </label>

        {message ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {message}
          </p>
        ) : null}

        <div className="mt-2 text-center">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 min-w-72 items-center justify-center gap-2.5 rounded-xl bg-red-600 px-8 text-sm font-bold text-white shadow-md transition hover:bg-red-700 disabled:opacity-60 hover:shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menyimpan &amp; Menyiapkan Psikotes...</span>
              </>
            ) : (
              <>
                <span>Kirim Biodata &amp; Lanjut ke Psikotes</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

