'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, ClipboardList, Copy, Edit3, ExternalLink, Plus, RefreshCw, Send, Trash2, X } from 'lucide-react'
import { AutocompleteInput } from '@/components/ui/autocomplete-input'
import { findProvinceByCity, getCitySuggestions, getProvinceSuggestions } from '@/lib/utils/indonesia-regions'

type JobRow = any
type ApplicationRow = any
type TestSet = { id: number; name: string; status: string }

const statusOptions = [
  ['submitted','Lamaran masuk'], ['hr_review','Review HR'], ['psychotest_invited','Psikotes diundang'], ['psychotest_completed','Psikotes selesai'],
  ['interview_hr','Interview HR'], ['interview_user','Interview User'], ['document_check','Pemberkasan'], ['offering','Offering'], ['hired','Diterima'], ['rejected','Tidak dilanjutkan'], ['withdrawn','Mengundurkan diri'],
]

const emptyJob = () => ({ title:'', slug:'', summary:'', description:'', responsibilities:'', qualifications:'', benefits:'Gaji kompetitif\nJenjang karier\nBonus & insentif\nPelatihan & pengembangan\nBPJS Kesehatan & Ketenagakerjaan', locationCity:'', locationProvince:'', placementDetail:'', employmentType:'Full Time', workMode:'On Site', experienceLevel:'Fresh Graduate', education:'SMA/SMK', salaryMin:'', salaryMax:'', applicationDeadline:'', applicationUrl:'', publishedAt:new Date().toISOString().slice(0,16), status:'draft' })

export function CareerManager() {
  const [tab, setTab] = useState<'jobs'|'applications'>('jobs')
  const [jobs, setJobs] = useState<JobRow[]>([]); const [applications, setApplications] = useState<ApplicationRow[]>([]); const [tests, setTests] = useState<TestSet[]>([])
  const [form, setForm] = useState<any>(emptyJob); const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [inviteSet, setInviteSet] = useState<Record<number,string>>({}); const [inviteLinks, setInviteLinks] = useState<Record<number,string>>({})

  async function load() {
    setLoading(true)
    try {
      const [jobsRes, appsRes, testsRes] = await Promise.all([fetch('/api/internal/careers/jobs',{cache:'no-store'}), fetch('/api/internal/careers/applications',{cache:'no-store'}), fetch('/api/internal/psychotests',{cache:'no-store'})])
      const [jobsJson, appsJson, testsJson] = await Promise.all([jobsRes.json(), appsRes.json(), testsRes.json()])
      setJobs(jobsJson.data || []); setApplications(appsJson.data || []); setTests((testsJson.data || []).filter((item: TestSet) => item.status === 'published'))
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function editJob(row: JobRow) {
    setEditingId(row.id); setForm({ title:row.title, slug:row.slug, summary:row.summary, description:row.description, responsibilities:row.responsibilities || '', qualifications:row.qualifications || '', benefits:row.benefits || '', locationCity:row.location_city, locationProvince:row.location_province, placementDetail:row.placement_detail || '', employmentType:row.employment_type, workMode:row.work_mode, experienceLevel:row.experience_level, education:row.education, salaryMin:row.salary_min ?? '', salaryMax:row.salary_max ?? '', applicationDeadline:row.application_deadline ? new Date(row.application_deadline).toISOString().slice(0,16) : '', applicationUrl:row.application_url || '', publishedAt:row.published_at ? new Date(row.published_at).toISOString().slice(0,16) : '', status:row.status }); window.scrollTo({top:0,behavior:'smooth'})
  }
  function reset() { setEditingId(null); setForm(emptyJob()); setErrorMsg(''); setSuccessMsg(''); setMessage('') }
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setErrorMsg(''); setSuccessMsg(''); setMessage('')
    try {
      const response = await fetch(editingId ? `/api/internal/careers/jobs/${editingId}` : '/api/internal/careers/jobs', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menyimpan lowongan.')
      setSuccessMsg(editingId ? 'Lowongan berhasil diperbarui.' : 'Lowongan berhasil dibuat.')
      reset()
      await load()
    } catch (e: any) {
      setErrorMsg(e.message || 'Gagal menyimpan lowongan.')
    } finally {
      setSaving(false)
    }
  }
  async function removeJob(id:number){if(!confirm('Hapus lowongan ini? Jika sudah ada pelamar sebaiknya ubah status menjadi closed.')) return; const r=await fetch(`/api/internal/careers/jobs/${id}`,{method:'DELETE'});const p=await r.json();if(!r.ok)return setErrorMsg(p.error||'Gagal menghapus.');setSuccessMsg('Lowongan dihapus.');await load()}
  async function updateApplication(row:ApplicationRow,status:string,notes:string){const r=await fetch(`/api/internal/careers/applications/${row.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status,internalNotes:notes})});const p=await r.json();if(!r.ok)return setErrorMsg(p.error||'Gagal memperbarui pelamar.');setSuccessMsg('Status pelamar diperbarui.');await load()}
  async function invite(row:ApplicationRow){const testSetId=Number(inviteSet[row.id]);if(!testSetId)return setErrorMsg('Pilih paket psikotes yang sudah published.');const r=await fetch(`/api/internal/careers/applications/${row.id}/invite`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({testSetId,expiresDays:3})});const p=await r.json();if(!r.ok)return setErrorMsg(p.error||'Gagal membuat undangan psikotes.');const url=`${window.location.origin}${p.assessmentPath}`;setInviteLinks(v=>({...v,[row.id]:url}));setSuccessMsg('Tautan psikotes dibuat. Kirim tautan ini hanya kepada kandidat terkait.');await load()}

  const publishedCount=jobs.filter(j=>j.status==='published').length
  return <div>
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Recruitment Management</p><h1 className="mt-2 text-3xl font-extrabold text-primary">Karir & Riwayat Pelamar</h1><p className="mt-2 text-sm text-text-muted">Kelola lowongan dan tautan lamaran eksternal. Lamaran baru diproses langsung di sistem rekrutmen Nusantara Sakti.</p></div><button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-primary"><RefreshCw size={16}/>Refresh</button></div>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><Stat icon={BriefcaseBusiness} label="Lowongan Published" value={publishedCount}/><Stat icon={ClipboardList} label="Total Pelamar" value={applications.length}/><Stat icon={Send} label="Psikotes Selesai" value={applications.filter(a=>a.status==='psychotest_completed').length}/></div>
    <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><strong>Alur baru:</strong> kandidat yang menekan tombol <em>Lamar Sekarang</em> langsung diarahkan ke URL rekrutmen Nusantara Sakti yang diisi pada masing-masing posisi. Tab Pelamar tetap tersedia hanya untuk melihat data historis sebelum alur eksternal digunakan.</div>
    <div className="mt-6 flex gap-2"><button onClick={()=>setTab('jobs')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab==='jobs'?'bg-primary text-white':'bg-white text-primary border border-slate-300'}`}>Lowongan</button><button onClick={()=>setTab('applications')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab==='applications'?'bg-primary text-white':'bg-white text-primary border border-slate-300'}`}>Pelamar (Riwayat)</button></div>

    {tab==='jobs'?<>
      <form onSubmit={submit} className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-bold text-primary">{editingId?`Edit Lowongan #${editingId}`:'Lowongan Baru'}</h2>{editingId?<button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><X size={15}/>Batal</button>:null}</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Nama Posisi"><input required className="input-internal" value={form.title} onChange={e=>setForm((v:any)=>({...v,title:e.target.value}))}/></Field>
          <Field label="Slug (opsional)"><input className="input-internal" value={form.slug} onChange={e=>setForm((v:any)=>({...v,slug:e.target.value}))}/></Field>
          <Field label="Provinsi">
            <AutocompleteInput
              value={form.locationProvince}
              onChange={val => setForm((v: any) => ({ ...v, locationProvince: val }))}
              getSuggestions={q => getProvinceSuggestions(q)}
              placeholder="Ketik nama provinsi, contoh: DKI Jakarta, Jawa Tengah"
              required
            />
          </Field>
          <Field label="Kota / Kabupaten">
            <AutocompleteInput
              value={form.locationCity}
              onChange={val => setForm((v: any) => ({ ...v, locationCity: val }))}
              onSelect={city => {
                if (!form.locationProvince) {
                  const autoProv = findProvinceByCity(city)
                  if (autoProv) setForm((v: any) => ({ ...v, locationProvince: autoProv }))
                }
              }}
              getSuggestions={q => getCitySuggestions(form.locationProvince, q)}
              placeholder="Ketik kota/kabupaten, contoh: Jakarta Barat, Kab. Tegal"
              required
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Detail Area / Cabang (opsional)">
              <input
                className="input-internal"
                placeholder="contoh: Slipi, Mejasem Barat, Dago (kosongkan jika tidak ada)"
                value={form.placementDetail}
                onChange={e => setForm((v: any) => ({ ...v, placementDetail: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="Tipe Pekerjaan"><input className="input-internal" value={form.employmentType} onChange={e=>setForm((v:any)=>({...v,employmentType:e.target.value}))}/></Field>
          <Field label="Mode Kerja"><input className="input-internal" value={form.workMode} onChange={e=>setForm((v:any)=>({...v,workMode:e.target.value}))}/></Field>
          <Field label="Pengalaman"><input className="input-internal" value={form.experienceLevel} onChange={e=>setForm((v:any)=>({...v,experienceLevel:e.target.value}))}/></Field>
          <Field label="Pendidikan"><input className="input-internal" value={form.education} onChange={e=>setForm((v:any)=>({...v,education:e.target.value}))}/></Field>
          <Field label="Gaji minimum"><input type="number" className="input-internal" value={form.salaryMin} onChange={e=>setForm((v:any)=>({...v,salaryMin:e.target.value}))}/></Field>
          <Field label="Gaji maksimum"><input type="number" className="input-internal" value={form.salaryMax} onChange={e=>setForm((v:any)=>({...v,salaryMax:e.target.value}))}/></Field>
          <Field label="Batas Lamaran"><input type="datetime-local" className="input-internal" value={form.applicationDeadline} onChange={e=>setForm((v:any)=>({...v,applicationDeadline:e.target.value}))}/></Field>
          <Field label="Status"><select className="input-internal" value={form.status} onChange={e=>setForm((v:any)=>({...v,status:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="closed">Closed</option></select></Field>
        </div>
        <div className="mt-4"><Field label="Link Lamaran / Recruitment URL"><div className="flex gap-2"><input type="url" required={form.status==='published'} placeholder="https://www.nusantara-sakti.com/psikotes/..." className="input-internal" value={form.applicationUrl} onChange={e=>setForm((v:any)=>({...v,applicationUrl:e.target.value}))}/>{form.applicationUrl?<a href={form.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 text-xs font-bold text-primary hover:bg-slate-50"><ExternalLink size={15}/>Test Link</a>:null}</div><p className="mt-1.5 text-[11px] font-normal text-slate-400">Wajib untuk status Published. Parameter UTM pada URL akan disimpan apa adanya.</p></Field></div>
        <div className="mt-4 grid gap-4"><Field label="Ringkasan untuk kartu lowongan"><textarea required rows={2} className="input-internal !h-auto py-3" value={form.summary} onChange={e=>setForm((v:any)=>({...v,summary:e.target.value}))}/></Field><Field label="Deskripsi pekerjaan"><textarea required rows={4} className="input-internal !h-auto py-3" value={form.description} onChange={e=>setForm((v:any)=>({...v,description:e.target.value}))}/></Field><Field label="Tanggung Jawab — satu poin per baris"><textarea rows={6} className="input-internal !h-auto py-3" value={form.responsibilities} onChange={e=>setForm((v:any)=>({...v,responsibilities:e.target.value}))}/></Field><Field label="Kualifikasi — satu poin per baris"><textarea rows={6} className="input-internal !h-auto py-3" value={form.qualifications} onChange={e=>setForm((v:any)=>({...v,qualifications:e.target.value}))}/></Field><Field label="Benefit — satu poin per baris"><textarea rows={5} className="input-internal !h-auto py-3" value={form.benefits} onChange={e=>setForm((v:any)=>({...v,benefits:e.target.value}))}/></Field></div>
        {errorMsg ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            ⚠️ {errorMsg}
          </div>
        ) : null}
        {successMsg ? (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
            ✓ {successMsg}
          </div>
        ) : null}
        <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          {editingId ? <Edit3 size={16} /> : <Plus size={16} />} {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Buat Lowongan'}
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-bold text-primary">Daftar Lowongan</h2></div><div className="divide-y divide-slate-100">{loading?<p className="p-6 text-sm text-slate-500">Memuat...</p>:jobs.map(row=><div key={row.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><strong className="text-sm text-primary">{row.title}</strong><p className="mt-1 text-xs text-slate-500">{row.location_city}{row.placement_detail ? ` - ${row.placement_detail}` : ''}, {row.location_province} · {row.education} · <span className={row.status==='published'?'text-emerald-600':row.status==='closed'?'text-red-600':'text-amber-600'}>{row.status}</span></p><p className={`mt-1 text-[11px] ${row.application_url?'text-emerald-600':'text-amber-600'}`}>{row.application_url?'Link lamaran eksternal tersedia':'Link lamaran belum diisi'}</p></div><div className="flex gap-2"><button onClick={()=>editJob(row)} className="rounded border border-slate-300 p-2 text-primary"><Edit3 size={16}/></button><button onClick={()=>removeJob(row.id)} className="rounded border border-red-200 p-2 text-red-600"><Trash2 size={16}/></button></div></div>)}</div></div>
    </>:<ApplicantList applications={applications} tests={tests} inviteSet={inviteSet} setInviteSet={setInviteSet} inviteLinks={inviteLinks} invite={invite} updateApplication={updateApplication}/>} 
  </div>
}

function ApplicantList({applications,tests,inviteSet,setInviteSet,inviteLinks,invite,updateApplication}:any){return <div className="mt-6 space-y-4">{applications.length?applications.map((row:any)=><ApplicantCard key={row.id} row={row} tests={tests} selected={inviteSet[row.id]||''} setSelected={(v:string)=>setInviteSet((old:any)=>({...old,[row.id]:v}))} link={inviteLinks[row.id]} invite={()=>invite(row)} update={updateApplication}/>):<div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">Belum ada pelamar.</div>}</div>}
function ApplicantCard({row,tests,selected,setSelected,link,invite,update}:any){const [status,setStatus]=useState(row.status);const [notes,setNotes]=useState(row.internal_notes||'');return <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-wide text-accent">{row.application_code}</span><h3 className="mt-1 text-lg font-bold text-primary">{row.full_name}</h3><p className="mt-1 text-xs text-slate-500">{row.job_title} · {row.city}, {row.province}</p><p className="mt-1 text-xs text-slate-500">{row.email} · {row.phone}</p></div><div className="text-right text-xs text-slate-500">Masuk {new Date(row.created_at).toLocaleString('id-ID')}</div></div><div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr_auto]"><select className="input-internal" value={status} onChange={e=>setStatus(e.target.value)}>{statusOptions.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><input className="input-internal" placeholder="Catatan internal HR" value={notes} onChange={e=>setNotes(e.target.value)}/><button onClick={()=>update(row,status,notes)} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white">Simpan Status</button></div>
  <div className="mt-4 rounded-lg bg-slate-50 p-4"><div className="grid gap-3 lg:grid-cols-[1fr_auto]"><div><span className="text-xs font-bold text-primary">Undangan Psikotes</span><div className="mt-2 flex flex-col gap-2 sm:flex-row"><select value={selected} onChange={e=>setSelected(e.target.value)} className="input-internal"><option value="">Pilih paket published</option>{tests.map((t:any)=><option key={t.id} value={t.id}>{t.name}</option>)}</select><button onClick={invite} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-white"><Send size={16}/>Buat Tautan 3 Hari</button></div></div>{row.assessment_name?<div className="text-xs text-slate-500 lg:text-right"><strong className="block text-primary">{row.assessment_name}</strong>Status: {row.assessment_status}<br/>{row.raw_score!=null&&row.max_score!=null?`Skor objektif: ${row.raw_score}/${row.max_score}`:'Skor belum tersedia'}</div>:null}</div>{link?<div className="mt-3 flex gap-2"><input readOnly className="input-internal text-xs" value={link}/><button onClick={()=>navigator.clipboard.writeText(link)} className="rounded-lg border border-slate-300 px-3 text-primary" title="Salin"><Copy size={16}/></button></div>:null}</div></div>}
function Stat({icon:Icon,label,value}:any){return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent"><Icon size={18}/></span><div><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span><strong className="text-2xl text-primary">{value}</strong></div></div></div>}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="text-xs font-semibold text-slate-600">{label}<div className="mt-1.5">{children}</div></label>}
