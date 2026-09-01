import { MapPin } from 'lucide-react'

export function StorefrontIllustration() {
  return (
    <div className="relative mx-auto flex min-h-[300px] max-w-[520px] items-end justify-center pb-8">
      <div className="absolute right-2 top-8 flex h-24 w-20 items-center justify-center rounded-full bg-accent/10 text-accent sm:right-8">
        <MapPin size={62} strokeWidth={2.2} />
      </div>
      <div className="absolute inset-x-2 bottom-1 h-24 -skew-y-3 rounded-[45%] bg-slate-100" />
      <div className="relative w-[78%] rounded-md border border-slate-300 bg-white shadow-xl">
        <div className="mx-auto -mt-10 h-12 w-[88%] bg-[#5b4635] [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]" />
        <div className="border-b-[7px] border-yellow-400 bg-primary px-5 py-4 text-center">
          <img src="/logo.png" alt="Gadai Sakti" className="mx-auto block h-auto w-[86%] max-w-[290px] object-contain" />
        </div>
        <div className="border-b-4 border-accent bg-accent px-3 py-1 text-center text-[10px] font-bold tracking-wide text-white">
          GADAI ELEKTRONIK &amp; MOTOR
        </div>
        <div className="grid grid-cols-[1fr_0.7fr_1fr] gap-3 p-5">
          <div className="h-24 border-4 border-primary/60 bg-sky-50" />
          <div className="h-28 border-4 border-primary bg-slate-100" />
          <div className="h-24 border-4 border-primary/60 bg-sky-50" />
        </div>
      </div>
    </div>
  )
}
