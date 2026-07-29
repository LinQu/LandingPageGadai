'use client'

import { FormEvent, useEffect, useState } from 'react'
import { MessageCircle, Search } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CostDetailCard, ItemInfoCard, TransactionInfoCard } from '@/components/faktur/detail-card'
import { ErrorState, EmptyState, FakturSkeleton } from '@/components/faktur/states'
import { StatusCard } from '@/components/faktur/status-card'
import { useFakturStatus } from '@/hooks/use-faktur-status'
import { getBranches } from '@/lib/services/branch.service'

function whatsappUrl(phone: string, cabkode: string, faktur: string) {
  const digits = phone.replace(/\D/g, '')
  const normalizedPhone = digits.startsWith('0') ? `62${digits.slice(1)}` : digits
  const message = `Halo Admin, saya ingin menanyakan status faktur gadai ${faktur} (#${cabkode}).`
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}

export default function CekStatusFakturPage() {
  const [nomorFaktur, setNomorFaktur] = useState('')
  const [branchPhone, setBranchPhone] = useState('')
  const { data, loading, error, isEmpty, search } = useFakturStatus()

  useEffect(() => {
    if (!data?.cabkode) return
    let active = true
    setBranchPhone('')
    void getBranches().then(branches => {
      const branch = branches.find(item => item.id.trim().toUpperCase() === data.cabkode.trim().toUpperCase())
      if (active) setBranchPhone(branch?.Phone || '')
    }).catch(() => { if (active) setBranchPhone('') })
    return () => { active = false }
  }, [data?.cabkode])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = nomorFaktur.trim()
    if (value) void search(value)
  }

  return <><Header /><main className="min-h-screen bg-bg-light py-10 sm:py-14"><div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <div className="mx-auto mb-8 max-w-2xl text-center"><h1 className="text-3xl font-bold text-primary sm:text-4xl">Cek Status Gadai</h1><p className="mt-3 text-text-muted">Masukkan nomor faktur untuk melihat informasi transaksi gadai Anda.</p></div>
    <form onSubmit={submit} className="mx-auto mb-10 flex max-w-2xl gap-3 rounded-2xl border border-border bg-white p-3 shadow-sm">
      <input value={nomorFaktur} onChange={event => setNomorFaktur(event.target.value)} placeholder="Masukkan nomor faktur gadai" inputMode="numeric" className="min-w-0 flex-1 rounded-xl px-3 text-sm outline-none placeholder:text-text-muted" aria-label="Nomor faktur gadai" />
      <button type="submit" disabled={loading || !nomorFaktur.trim()} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"><Search className="size-4" /><span className="hidden sm:inline">Cari</span></button>
    </form>
    {loading && <FakturSkeleton />}{error && <ErrorState message={error} />}{isEmpty && <EmptyState />}
    {data && !loading && <div className="space-y-6"><StatusCard detail={data} /><div className="grid gap-6 md:grid-cols-2"><TransactionInfoCard detail={data} /><ItemInfoCard detail={data} /></div><div className="grid gap-6 md:grid-cols-2"><CostDetailCard detail={data} /><section className="rounded-2xl border border-border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold text-primary">Hubungi Admin</h2><p className="mt-3 text-sm leading-6 text-text-muted">Butuh bantuan mengenai transaksi ini? Hubungi admin {data.namacab}. Website ini hanya menampilkan informasi transaksi dan tidak melayani pembayaran, pelunasan, atau perpanjangan.</p>{branchPhone ? <a href={whatsappUrl(branchPhone, data.cabkode, data.faktur)} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-700 px-4 py-3 text-sm font-semibold text-white hover:bg-green-800"><MessageCircle className="size-5" />Hubungi Admin</a> : <p className="mt-6 rounded-xl bg-slate-100 p-4 text-sm text-text-muted">Nomor WhatsApp cabang sedang tidak tersedia. Silakan coba beberapa saat lagi.</p>}</section></div></div>}
  </div></main><Footer /></>
}
