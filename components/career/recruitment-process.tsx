import { ClipboardList, BrainCircuit, UserRoundSearch, UsersRound, FileCheck2, Handshake } from 'lucide-react'

const steps = [
  { icon: ClipboardList, label: 'Kirim Lamaran' },
  { icon: BrainCircuit, label: 'Psikotes' },
  { icon: UserRoundSearch, label: 'Interview HR' },
  { icon: UsersRound, label: 'Interview User' },
  { icon: FileCheck2, label: 'Pemberkasan' },
  { icon: Handshake, label: 'Offering / Penempatan' },
]

export function RecruitmentProcess() {
  return (
    <div className="rounded-xl bg-slate-50 p-4 sm:p-5">
      <h3 className="text-base font-bold text-primary">Proses Rekrutmen</h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map(({ icon: Icon, label }, index) => (
          <div key={label} className="relative text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/15 bg-white text-primary shadow-sm">
              <Icon size={22} />
            </div>
            <span className="mt-2 block text-[10px] font-medium leading-4 text-text-muted">{index + 1}. {label}</span>
            {index < steps.length - 1 ? <span className="absolute left-[calc(50%+30px)] top-6 hidden h-px w-[calc(100%-60px)] bg-primary/25 lg:block" /> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
