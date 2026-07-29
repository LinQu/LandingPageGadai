import { AlertCircle, FileQuestion } from 'lucide-react'

export function FakturSkeleton() {
  return <div className="animate-pulse space-y-6"><div className="h-72 rounded-2xl bg-slate-200" /><div className="grid gap-6 md:grid-cols-2"><div className="h-64 rounded-2xl bg-slate-200" /><div className="h-64 rounded-2xl bg-slate-200" /></div><div className="h-72 rounded-2xl bg-slate-200" /></div>
}

export function EmptyState() {
  return <div className="rounded-2xl border border-dashed border-border bg-white px-6 py-14 text-center"><FileQuestion className="mx-auto mb-4 size-12 text-text-muted" /><h2 className="text-xl font-bold text-primary">Nomor faktur tidak ditemukan.</h2><p className="mt-2 text-text-muted">Silakan periksa kembali nomor faktur Anda.</p></div>
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"><AlertCircle className="mx-auto mb-3 size-10 text-red-600" /><h2 className="text-lg font-bold text-red-900">Pencarian tidak dapat diproses</h2><p className="mt-2 text-sm text-red-700">{message}</p></div>
}
