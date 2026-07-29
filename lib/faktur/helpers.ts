import type { CostDetail, FakturDetail, FakturStatus, StatusMeta, TransactionType } from './types'

const DEFAULT_VALUE = '-'

export function formatCurrency(value: string | number | null | undefined): string {
  const amount = typeof value === 'string' ? Number(value) : value
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return DEFAULT_VALUE
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)
}

export function formatDateID(value: string | null | undefined): string {
  if (!value || value === '0000-00-00') return DEFAULT_VALUE
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return DEFAULT_VALUE
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)
}

export function mapStatus(status?: string, statusLunas?: string): StatusMeta {
  const normalizedStatus = status?.trim().toUpperCase()
  const normalizedStatusLunas = statusLunas?.trim().toUpperCase()
  let code: FakturStatus = 'UNKNOWN'

  if (normalizedStatus === 'INPG') code = 'AKTIF'
  else if (normalizedStatus === 'CLSD' && normalizedStatusLunas === 'PPRJ') code = 'AKTIF_PERPANJANGAN'
  else if (normalizedStatus === 'CLSD' && normalizedStatusLunas === 'PLNG') code = 'SUDAH_DITEBUS'

  const statuses: Record<FakturStatus, StatusMeta> = {
    AKTIF: { code, label: 'AKTIF', description: 'Barang masih menjadi jaminan dan pinjaman masih aktif.', badgeClassName: 'bg-emerald-100 text-emerald-800' },
    AKTIF_PERPANJANGAN: { code, label: 'AKTIF (PERPANJANGAN)', description: 'Faktur lama telah ditutup untuk perpanjangan. Barang masih menjadi jaminan dan pinjaman tetap aktif.', badgeClassName: 'bg-green-100 text-green-800' },
    SUDAH_DITEBUS: { code, label: 'SUDAH DITEBUS', description: 'Barang telah ditebus. Tidak ada pinjaman aktif atau tagihan berjalan.', badgeClassName: 'bg-green-800 text-white' },
    UNKNOWN: { code, label: 'STATUS BELUM TERIDENTIFIKASI', description: 'Status transaksi belum dapat dipetakan. Silakan hubungi admin cabang.', badgeClassName: 'bg-slate-100 text-slate-700' },
  }
  return statuses[code]
}

export function mapTransactionType(value?: string): TransactionType {
  const type = value?.trim().toUpperCase()
  if (type === 'BARU') return 'PINJAMAN_BARU'
  if (type === 'PINJAMAN_ULANG') return 'PINJAMAN_ULANG'
  return 'UNKNOWN'
}

export function getTransactionTypeLabel(value?: string): string {
  const type = mapTransactionType(value)
  return type === 'PINJAMAN_BARU' ? 'Pinjaman Baru' : type === 'PINJAMAN_ULANG' ? 'Perpanjangan Pinjaman' : value || DEFAULT_VALUE
}

function getIndonesiaToday(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date())
  const part = (type: string) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function calculateLateFee(
  dueDate: string | undefined,
  principal: string | number,
  status: FakturStatus,
): CostDetail['lateFee'] | undefined {
  // Denda hanya relevan untuk transaksi yang masih aktif, bukan faktur yang sudah ditebus.
  if (status !== 'AKTIF' && status !== 'AKTIF_PERPANJANGAN') return undefined
  if (!dueDate || dueDate === '0000-00-00') return undefined

  const dueTime = new Date(`${dueDate}T00:00:00`).getTime()
  const todayTime = new Date(`${getIndonesiaToday()}T00:00:00`).getTime()
  const overdueDays = Math.floor((todayTime - dueTime) / 86_400_000)
  const loanPrincipal = Number(principal)

  if (!Number.isFinite(dueTime) || overdueDays <= 0 || !Number.isFinite(loanPrincipal) || loanPrincipal <= 0) {
    return undefined
  }

  const rate = overdueDays <= 15 ? overdueDays * 0.0035 : 0.05
  return { overdueDays, rate, amount: loanPrincipal * rate }
}

export function mapCostDetail(detail: FakturDetail, status: FakturStatus): CostDetail {
  if (status === 'SUDAH_DITEBUS') {
    return {
      title: 'Rincian Pelunasan',
      rows: [
        { label: 'Total yang pernah dibayar', value: detail.biayapprj },
        { label: 'Metode pembayaran', value: detail.tipebayar },
        ...(detail.tanggalpelunasan ? [{ label: 'Tanggal pelunasan', value: formatDateID(detail.tanggalpelunasan) }] : []),
      ],
    }
  }
  if (mapTransactionType(detail.tipegadai) === 'PINJAMAN_ULANG') {
    const lateFee = calculateLateFee(detail.tanggaljtp, detail.totpokpprj, status)
    return {
      title: 'Rincian Perpanjangan',
      rows: [
        { label: 'Sisa Pokok', value: detail.totpokpprj },
        { label: 'Bayar Pokok', value: detail.bayarpokokpprj },
        { label: 'Tarif Sewa', value: detail.tarifsewapprj },
        { label: 'Administrasi', value: detail.biayaadmpprj },
      ],
      total: { label: 'Total Dibayar', value: (Number(detail.biayapprj) || 0) + (lateFee?.amount || 0) },
      footer: { label: 'Sisa Hutang', value: detail.totpokpprj },
      lateFee,
    }
  }
  const total = [detail.totpokbaru, detail.tarifsewabaru, detail.biayaadmbaru, detail.terimakonsumenbaru].reduce<number>((sum, value) => sum + (Number(value) || 0), 0)
  const lateFee = calculateLateFee(detail.tanggaljtp, detail.totpokbaru, status)
  return {
    title: 'Rincian Pinjaman',
    rows: [
      { label: 'Nilai Pinjaman', value: detail.totpokbaru },
      { label: 'Sewa Modal', value: detail.tarifsewabaru },
      { label: 'Administrasi', value: detail.biayaadmbaru },
    ],
    total: { label: lateFee ? 'Total Tagihan Saat Ini' : 'Total Pinjaman', value: (Number(detail.totpokbaru) || total) + (lateFee?.amount || 0) },
    lateFee,
  }
}
