import Image from 'next/image'
import { BadgeCheck, Store, Users } from 'lucide-react'

const stats = [
  { icon: Store, value: '20+', label: 'Cabang Aktif' },
  { icon: BadgeCheck, value: '20+', label: 'Rating / Cabang Dinilai' },
  { icon: Users, value: '99,999+', label: 'Nasabah Dilayani' },
]

export function AboutOverview() {
  return (
    <section className="bg-white py-9 sm:py-11 lg:py-14">
      <div className="site-container">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,0.92fr)] lg:items-stretch lg:gap-6 xl:gap-8 2xl:gap-9">
          <div className="flex min-w-0 flex-col justify-center lg:py-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-accent sm:text-xs">
              Tentang Gadai Sakti
            </p>

            <h1 className="mt-2 max-w-[820px] text-[clamp(2.15rem,3.7vw,3.55rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-primary">
              Solusi Dana Cepat dengan Jaminan Barang Elektronik dan Motor
            </h1>

            <div className="mt-5 max-w-[820px] space-y-3.5 text-[13px] leading-6 text-text-muted sm:text-sm sm:leading-7">
              <p>
                Gadai Sakti hadir sebagai solusi keuangan berbasis gadai untuk membantu masyarakat mendapatkan dana dengan proses yang mudah dipahami. Kami mengutamakan transparansi, keamanan barang jaminan, dan layanan yang responsif di cabang.
              </p>
              <p>
                Komitmen kami adalah membangun pengalaman gadai yang praktis dan bertanggung jawab, dengan informasi taksiran dan ketentuan yang disampaikan secara jelas sebelum transaksi dilanjutkan.
              </p>
            </div>

            <div className="mt-5 flex w-full max-w-[790px] items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_8px_28px_rgba(15,23,42,0.06)] sm:gap-4 sm:p-4">
              <div className="flex h-12 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-2 border border-slate-100 shadow-sm sm:h-14 sm:w-36">
                <Image
                  src="/ojk.png"
                  alt="Otoritas Jasa Keuangan"
                  width={140}
                  height={56}
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-primary sm:text-sm">
                  Berizin &amp; Diawasi oleh Otoritas Jasa Keuangan (OJK)
                </p>
                <p className="text-[10px] leading-4 text-text-muted sm:text-xs">
                  Seluruh layanan dan operasional Gadai Sakti resmi terdaftar serta diawasi oleh Otoritas Jasa Keuangan untuk memberikan jaminan keamanan transaksi bagi seluruh nasabah.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:min-h-[390px] lg:min-h-0 lg:h-full">
            <Image
              src="/images/about/gadai-sakti-storefront.webp"
              alt="Tampak depan outlet Gadai Sakti"
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 48vw"
              className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.015]"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl bg-primary text-white shadow-[0_12px_34px_rgba(15,45,61,0.15)] sm:mt-8">
          <div className="grid sm:grid-cols-3">
            {stats.map(({ icon: Icon, value, label }, index) => (
              <div
                key={label}
                className={`flex min-h-[96px] items-center justify-center gap-4 px-5 py-5 sm:min-h-[108px] sm:px-6 ${
                  index ? 'border-t border-white/15 sm:border-l sm:border-t-0' : ''
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-[0_8px_24px_rgba(239,49,57,0.3)] sm:h-12 sm:w-12">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <strong className="block text-2xl font-extrabold leading-none sm:text-3xl">{value}</strong>
                  <span className="mt-1.5 block text-[10px] leading-4 text-white/70 sm:text-xs">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
