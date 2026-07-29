import { formatCurrency, formatDateID, getTransactionTypeLabel, mapCostDetail, mapStatus } from '@/lib/faktur/helpers'
import type { FakturDetail } from '@/lib/faktur/types'
import { Info } from './status-card'

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-border bg-white p-6 shadow-sm"><h2 className="mb-5 text-xl font-bold text-primary">{title}</h2>{children}</section>
}

export function TransactionInfoCard({ detail }: { detail: FakturDetail }) {
  return <Card title="Informasi Gadai"><div className="grid gap-5 text-sm sm:grid-cols-2">
    <Info label="Nomor Faktur" value={detail.faktur} /><Info label="Nama Nasabah" value={detail.namapinjaman} />
    <Info label="Cabang" value={detail.namacab} /><Info label="Jenis Gadai" value={getTransactionTypeLabel(detail.tipegadai)} />
    <Info label="Metode Pencairan" value={detail.tipebayar} /><Info label="Tanggal Gadai" value={formatDateID(detail.tanggalgadai)} />
    <Info label="Tanggal Jatuh Tempo" value={formatDateID(detail.tanggaljtp)} />
  </div></Card>
}

export function ItemInfoCard({ detail }: { detail: FakturDetail }) {
  return <Card title="Informasi Barang"><div className="grid gap-5 text-sm sm:grid-cols-3">
    <Info label="Nilai Taksiran" value={formatCurrency(detail.hrgpasarbaru)} />
    <Info label="Maksimal Pinjaman" value={formatCurrency(detail.maxcairbaru)} />
    <Info label="Tenor" value={detail.tenorbaru ? `${detail.tenorbaru} hari` : '-'} />
  </div><p className="mt-6 border-t border-border pt-4 text-xs leading-5 text-text-muted">Informasi barang tambahan, seperti nama barang, IMEI, serial number, nomor SBG, dan foto barang, akan ditampilkan di sini saat tersedia dari sistem.</p></Card>
}

export function CostDetailCard({ detail }: { detail: FakturDetail }) {
  const status = mapStatus(detail.status, detail.statuslunas)
  const cost = mapCostDetail(detail, status.code)
  return <Card title={cost.title}>
    <div className="space-y-3 text-sm">{cost.rows.map(row => <Row key={row.label} label={row.label} value={row.label.includes('Metode') || row.label.includes('Tanggal') ? String(row.value || '-') : formatCurrency(row.value)} />)}</div>
    {cost.lateFee && <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="mb-3 text-sm font-bold text-amber-900">Rincian Denda Keterlambatan</p><div className="space-y-2 text-sm"><Row label="Keterlambatan" value={`${cost.lateFee.overdueDays} hari`} /><Row label="Tarif Denda" value={`${(cost.lateFee.rate * 100).toLocaleString('id-ID', { maximumFractionDigits: 2 })}%`} /><Row strong label="Total Denda" value={formatCurrency(cost.lateFee.amount)} /></div></div>}
    {cost.total && <div className="mt-5 border-t border-border pt-4"><Row strong label={cost.total.label} value={formatCurrency(cost.total.value)} /></div>}
    {cost.footer && <div className="mt-4 rounded-xl bg-slate-50 p-4"><Row strong label={cost.footer.label} value={formatCurrency(cost.footer.value)} /></div>}
    {status.code === 'SUDAH_DITEBUS' && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm leading-6 text-green-900">Transaksi telah selesai. Website ini tidak melayani pembayaran, pelunasan, maupun perpanjangan.</p>}
  </Card>
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-4"><span className={strong ? 'font-semibold text-text-main' : 'text-text-muted'}>{label}</span><span className={strong ? 'font-bold text-primary' : 'font-medium text-text-main'}>{value}</span></div>
}
