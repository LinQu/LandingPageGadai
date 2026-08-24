'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Clock3, Loader2, ShieldCheck } from 'lucide-react'

type Option = { option_key: string; option_text: string }
type Question = { id: number; question_text: string; question_type: 'single_choice'|'multiple_choice'|'short_text'|'scale_1_5'; is_required: number; options: Option[] }
type Section = { id: number; title: string; instructions: string; duration_minutes: number; section_order: number; questions?: Question[] }
type Data = {
  status: 'invited'|'in_progress'|'submitted'|'expired'|'cancelled'
  full_name: string; application_code: string; job_title: string; test_name: string; test_description: string; test_instructions: string
  current_section_order: number; sections: Section[]; currentSection: Section | null; answers: Record<string, any>; sectionDeadline?: string | null
}

export function PsychotestCandidate({ token }: { token: string }) {
  const [data, setData] = useState<Data | null>(null)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [remaining, setRemaining] = useState(0)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const response = await fetch(`/api/careers/assessment/${encodeURIComponent(token)}`, { cache: 'no-store' })
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Psikotes tidak dapat dimuat.')
      setData(payload.data); setAnswers(payload.data.answers || {})
      if (payload.data.sectionDeadline) setRemaining(Math.max(0, Math.ceil((new Date(payload.data.sectionDeadline).getTime() - new Date(payload.serverNow).getTime()) / 1000)))
    } catch (e: any) { setError(e.message || 'Psikotes tidak dapat dimuat.') }
    finally { setLoading(false) }
  }, [token])

  useEffect(() => { load() }, [load])

  const current = data?.currentSection
  const isLast = data ? Number(data.current_section_order) >= data.sections.length : false

  const submitAssessment = useCallback(async () => {
    setBusy(true)
    try {
      const response = await fetch(`/api/careers/assessment/${encodeURIComponent(token)}/submit`, { method: 'POST' })
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Psikotes belum dapat dikirim.')
      await load()
    } catch (e: any) { setError(e.message || 'Psikotes belum dapat dikirim.') }
    finally { setBusy(false) }
  }, [token, load])

  const advance = useCallback(async (forced = false) => {
    if (busy || !data || data.status !== 'in_progress') return
    if (!forced && current) {
      const incomplete = (current.questions || []).some(q => q.is_required && (answers[String(q.id)] == null || answers[String(q.id)] === '' || (Array.isArray(answers[String(q.id)]) && !answers[String(q.id)].length)))
      if (incomplete) return setError('Lengkapi pertanyaan wajib sebelum melanjutkan bagian ini.')
    }
    setError('')
    if (isLast) return submitAssessment()
    setBusy(true)
    try {
      const response = await fetch(`/api/careers/assessment/${encodeURIComponent(token)}/advance`, { method: 'POST' })
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Tidak dapat melanjutkan bagian.')
      await load()
    } catch (e: any) { setError(e.message || 'Tidak dapat melanjutkan bagian.') }
    finally { setBusy(false) }
  }, [answers, busy, current, data, isLast, load, submitAssessment, token])

  useEffect(() => {
    if (!data || data.status !== 'in_progress' || !data.sectionDeadline) return
    const timer = window.setInterval(() => setRemaining(value => {
      if (value <= 1) { window.clearInterval(timer); window.setTimeout(() => advance(true), 0); return 0 }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [data?.sectionDeadline, data?.status, advance])

  async function start() {
    setBusy(true); setError('')
    try {
      const response = await fetch(`/api/careers/assessment/${encodeURIComponent(token)}/start`, { method: 'POST' })
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Psikotes tidak dapat dimulai.')
      await load()
    } catch (e: any) { setError(e.message || 'Psikotes tidak dapat dimulai.') }
    finally { setBusy(false) }
  }

  async function save(questionId: number, answer: any) {
    setAnswers(value => ({ ...value, [String(questionId)]: answer }))
    try {
      const response = await fetch(`/api/careers/assessment/${encodeURIComponent(token)}/answer`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ questionId, answer }) })
      const payload = await response.json(); if (!response.ok && payload.code === 'SECTION_EXPIRED') advance(true)
    } catch {}
  }

  const totalMinutes = useMemo(() => data?.sections.reduce((sum, section) => sum + Number(section.duration_minutes || 0), 0) || 0, [data])
  const timeText = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  if (loading) return <Shell><div className="py-24 text-center text-sm text-slate-500"><Loader2 className="mx-auto mb-3 animate-spin" />Memuat asesmen...</div></Shell>
  if (error && !data) return <Shell><StateCard icon={AlertCircle} title="Psikotes tidak dapat dibuka" text={error} /></Shell>
  if (!data) return null
  if (data.status === 'expired' || data.status === 'cancelled') return <Shell><StateCard icon={AlertCircle} title="Tautan tidak aktif" text={data.status === 'expired' ? 'Masa berlaku undangan psikotes sudah berakhir. Hubungi tim HR jika memerlukan tautan baru.' : 'Undangan psikotes ini sudah dibatalkan oleh tim HR.'} /></Shell>
  if (data.status === 'submitted') return <Shell><StateCard icon={CheckCircle2} title="Psikotes sudah dikirim" text="Jawaban sudah tersimpan. Hasil asesmen akan ditinjau bersama informasi rekrutmen lain oleh tim HR. Sistem tidak memberikan keputusan lulus/gagal secara otomatis." /></Shell>

  if (data.status === 'invited') return (
    <Shell>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Undangan Psikotes</p>
        <h1 className="mt-2 text-3xl font-extrabold text-primary">{data.test_name}</h1>
        <p className="mt-2 text-sm text-text-muted">{data.full_name} · {data.application_code} · {data.job_title}</p>
        <p className="mt-6 text-sm leading-6 text-text-muted">{data.test_description}</p>
        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-text-muted whitespace-pre-line">{data.test_instructions}</div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Mini label="Jumlah Bagian" value={`${data.sections.length} bagian`} />
          <Mini label="Estimasi Durasi" value={`${totalMinutes} menit`} />
          <Mini label="Penyimpanan" value="Jawaban tersimpan otomatis" />
        </div>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900">Setiap bagian memiliki batas waktu. Setelah berpindah bagian, jawaban pada bagian sebelumnya tidak dapat diubah. Pastikan koneksi stabil sebelum memulai.</div>
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        <button disabled={busy} onClick={start} className="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-primary-light disabled:opacity-60">{busy ? <Loader2 size={17} className="animate-spin" /> : <ShieldCheck size={17} />} Mulai Psikotes</button>
      </div>
    </Shell>
  )

  return (
    <Shell>
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{data.test_name}</p>
          <h2 className="mt-2 text-lg font-bold text-primary">{data.full_name}</h2>
          <p className="mt-1 text-xs text-slate-500">{data.application_code}</p>
          <div className="mt-5 flex items-center gap-2 rounded-lg bg-primary px-3 py-3 text-white"><Clock3 size={18} /><div><span className="block text-[10px] text-white/60">Sisa waktu bagian</span><strong className="text-lg tabular-nums">{timeText}</strong></div></div>
          <ol className="mt-5 space-y-2">
            {data.sections.map(section => <li key={section.id} className={`rounded-lg px-3 py-2 text-xs font-semibold ${Number(section.section_order) === Number(data.current_section_order) ? 'bg-accent/10 text-accent' : Number(section.section_order) < Number(data.current_section_order) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-400'}`}>{section.section_order}. {section.title}</li>)}
          </ol>
        </aside>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Bagian {data.current_section_order} dari {data.sections.length}</p><h1 className="mt-2 text-2xl font-extrabold text-primary">{current?.title}</h1><p className="mt-2 text-sm leading-6 text-text-muted whitespace-pre-line">{current?.instructions}</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-primary">{current?.questions?.length || 0} soal</span></div>
          <div className="mt-7 space-y-6">
            {(current?.questions || []).map((question, index) => <QuestionField key={question.id} question={question} index={index} value={answers[String(question.id)]} onChange={value => save(question.id, value)} />)}
          </div>
          {error ? <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-8 flex justify-end"><button disabled={busy} onClick={() => advance(false)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-primary-light disabled:opacity-60">{busy ? <Loader2 size={17} className="animate-spin" /> : null}{isLast ? 'Kirim Psikotes' : 'Lanjut Bagian'} <ChevronRight size={17} /></button></div>
        </section>
      </div>
    </Shell>
  )
}

function QuestionField({ question, index, value, onChange }: { question: Question; index: number; value: any; onChange: (value: any) => void }) {
  return <div className="rounded-xl border border-slate-200 p-5"><p className="text-sm font-semibold leading-6 text-primary">{index + 1}. {question.question_text}{question.is_required ? <span className="ml-1 text-accent">*</span> : null}</p><div className="mt-4">
    {question.question_type === 'single_choice' ? <div className="space-y-2">{question.options.map(option => <label key={option.option_key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"><input type="radio" name={`q-${question.id}`} checked={value === option.option_key} onChange={() => onChange(option.option_key)} className="mt-1" /><span><strong className="mr-2 text-primary">{option.option_key}.</strong>{option.option_text}</span></label>)}</div> : null}
    {question.question_type === 'multiple_choice' ? <div className="space-y-2">{question.options.map(option => { const selected = Array.isArray(value) && value.includes(option.option_key); return <label key={option.option_key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"><input type="checkbox" checked={selected} onChange={e => onChange(e.target.checked ? [...(Array.isArray(value) ? value : []), option.option_key] : (Array.isArray(value) ? value.filter((item: string) => item !== option.option_key) : []))} className="mt-1" /><span><strong className="mr-2 text-primary">{option.option_key}.</strong>{option.option_text}</span></label> })}</div> : null}
    {question.question_type === 'short_text' ? <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-primary" /> : null}
    {question.question_type === 'scale_1_5' ? <div className="grid grid-cols-5 gap-2">{[1,2,3,4,5].map(number => <label key={number} className={`cursor-pointer rounded-lg border p-3 text-center text-sm font-bold ${Number(value) === number ? 'border-primary bg-primary text-white' : 'border-slate-200 text-primary'}`}><input className="sr-only" type="radio" name={`q-${question.id}`} checked={Number(value) === number} onChange={() => onChange(number)} />{number}</label>)}</div> : null}
  </div></div>
}

function Shell({ children }: { children: React.ReactNode }) { return <main className="min-h-screen bg-slate-100"><header className="bg-primary"><div className="mx-auto flex h-16 max-w-6xl items-center px-5"><img src="/logo.png" alt="Gadai Sakti" className="h-8 w-auto" /></div></header><div className="mx-auto max-w-6xl px-5 py-8 md:py-12">{children}</div></main> }
function Mini({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-slate-200 p-4"><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span><strong className="mt-1 block text-sm text-primary">{value}</strong></div> }
function StateCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) { return <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><Icon className="mx-auto text-primary" size={44} /><h1 className="mt-4 text-2xl font-extrabold text-primary">{title}</h1><p className="mt-3 text-sm leading-6 text-text-muted">{text}</p></div> }
