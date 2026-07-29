import { CheckCircle2, CircleDot, HelpCircle } from 'lucide-react'
import { formatDateID, mapStatus } from '@/lib/faktur/helpers'
import type { FakturDetail } from '@/lib/faktur/types'

export function StatusCard({ detail }: { detail: FakturDetail }) {
  const status = mapStatus(detail.status, detail.statuslunas)
  const Icon = status.code === 'SUDAH_DITEBUS' ? CheckCircle2 : status.code === 'UNKNOWN' ? HelpCircle : CircleDot
  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-muted">Status Gadai</p>
          <h2 className="mt-1 text-2xl font-bold text-primary">Informasi Transaksi</h2>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${status.badgeClassName}`}>
          <Icon className="size-4" /> {status.label}
        </span>
      </div>
      <p className="mb-6 max-w-2xl text-sm leading-6 text-text-muted">{status.description}</p>
      <div className="grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <Info label="Nomor Faktur" value={detail.faktur} />
        <Info label="Nama Nasabah" value={detail.namapinjaman} />
        <Info label="Cabang" value={detail.namacab} />
        <Info label="Tanggal Gadai" value={formatDateID(detail.tanggalgadai)} />
        <Info label="Tanggal Jatuh Tempo" value={formatDateID(detail.tanggaljtp)} />
      </div>
    </section>
  )
}

export function Info({ label, value }: { label: string; value?: string | number }) {
  return <div><p className="text-xs text-text-muted">{label}</p><p className="mt-1 font-semibold text-text-main">{value || '-'}</p></div>
}
