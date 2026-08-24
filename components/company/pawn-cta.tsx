import Link from 'next/link'
import { ArrowRight, Calculator, MapPin, ShieldCheck } from 'lucide-react'

export function PawnCta({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`overflow-hidden rounded-2xl bg-primary text-white ${compact ? 'p-6' : 'p-7 md:p-9'}`}>
      <div className="grid items-center gap-7 md:grid-cols-[1fr_auto]">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Butuh dana sekarang?</span>
          <h2 className={`${compact ? 'mt-2 text-2xl' : 'mt-2 text-3xl md:text-4xl'} font-bold text-white`}>
            Gadaikan barang di Gadai Sakti dengan proses yang jelas.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Cek estimasi terlebih dahulu atau temukan cabang terdekat untuk pemeriksaan dan taksiran final barang Anda.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs text-white/75">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Aman &amp; transparan</span>
            <span className="inline-flex items-center gap-2"><MapPin size={16} /> Cabang mudah dicari</span>
          </div>
        </div>
        <div className="flex min-w-[190px] flex-col gap-3">
          <Link href="/simulasi" className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-dark">
            <Calculator size={18} /> Simulasi Gadai
          </Link>
          <Link href="/cabang" className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-primary">
            Temukan Cabang <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  )
}
