export interface FakturDetail {
  faktur: string
  status: string
  statuslunas: string
  tanggalgadai: string
  tanggaljtp: string
  namacab: string
  cabkode: string
  tipegadai: string
  tipebayar: string
  hrgpasarbaru: string | number
  tarifsewabaru: string | number
  biayaadmbaru: string | number
  maxcairbaru: string | number
  totpokbaru: string | number
  terimakonsumenbaru: string | number
  tenorbaru: string | number
  totpokpprj: string | number
  biayadendapprj: string | number
  biayaadmpprj: string | number
  bayarpokokpprj: string | number
  tarifsewapprj: string | number
  biayapprj: string | number
  totpprj: string | number
  namapinjaman: string
  tanggalpelunasan?: string
}

export interface FakturApiResponse {
  status: string
  Detail?: FakturDetail[]
  message?: string
}

export type FakturStatus = 'AKTIF' | 'AKTIF_PERPANJANGAN' | 'SUDAH_DITEBUS' | 'UNKNOWN'
export type TransactionType = 'PINJAMAN_BARU' | 'PINJAMAN_ULANG' | 'UNKNOWN'

export interface StatusMeta {
  code: FakturStatus
  label: string
  description: string
  badgeClassName: string
}

export interface CostDetail {
  title: string
  rows: Array<{ label: string; value: string | number }>
  total?: { label: string; value: string | number }
  footer?: { label: string; value: string | number }
  lateFee?: {
    overdueDays: number
    rate: number
    amount: number
  }
}
