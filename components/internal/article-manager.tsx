'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Edit3, Plus, RefreshCw, Trash2, X } from 'lucide-react'

type Row = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author: string
  category: string
  published_at: string
  read_time: number
  status: 'draft' | 'published'
}

type FormState = {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string
  author: string
  category: string
  publishedAt: string
  readTime: number
  status: 'draft' | 'published'
}

const emptyForm = (): FormState => ({
  title: '', slug: '', excerpt: '', content: '', coverImageUrl: '', author: 'Tim Gadai Sakti', category: 'Edukasi',
  publishedAt: new Date().toISOString().slice(0, 16), readTime: 5, status: 'draft',
})

export function ArticleManager() {
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const response = await fetch('/api/internal/articles', { cache: 'no-store' })
    const payload = await response.json()
    setRows(payload.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function edit(row: Row) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      content: row.content,
      coverImageUrl: row.cover_image_url || '',
      author: row.author,
      category: row.category,
      publishedAt: new Date(row.published_at).toISOString().slice(0, 16),
      readTime: Number(row.read_time || 5),
      status: row.status,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm())
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(editingId ? `/api/internal/articles/${editingId}` : '/api/internal/articles', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menyimpan artikel.')
      setMessage(editingId ? 'Artikel berhasil diperbarui.' : 'Artikel berhasil dibuat.')
      reset()
      await load()
    } catch (error: any) {
      setMessage(error.message || 'Gagal menyimpan artikel.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Hapus artikel ini? Tindakan tidak dapat dibatalkan.')) return
    const response = await fetch(`/api/internal/articles/${id}`, { method: 'DELETE' })
    const payload = await response.json()
    if (!response.ok) return setMessage(payload.error || 'Gagal menghapus artikel.')
    setMessage('Artikel dihapus.')
    await load()
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Content Management</p><h1 className="mt-2 text-3xl font-extrabold text-primary">Artikel</h1><p className="mt-2 text-sm text-text-muted">Konten berstatus published otomatis dapat muncul di halaman publik.</p></div>
        <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-primary"><RefreshCw size={16} /> Refresh</button>
      </div>

      <form onSubmit={submit} className="mt-7 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold text-primary">{editingId ? `Edit Artikel #${editingId}` : 'Artikel Baru'}</h2>{editingId ? <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500"><X size={15} /> Batal edit</button> : null}</div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Judul"><input required value={form.title} onChange={e => setForm(v => ({ ...v, title: e.target.value }))} className="input-internal" /></Field>
          <Field label="Slug (opsional, otomatis dari judul)"><input value={form.slug} onChange={e => setForm(v => ({ ...v, slug: e.target.value }))} className="input-internal" /></Field>
          <Field label="Kategori"><input value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))} className="input-internal" /></Field>
          <Field label="Penulis"><input value={form.author} onChange={e => setForm(v => ({ ...v, author: e.target.value }))} className="input-internal" /></Field>
          <Field label="URL Cover"><input value={form.coverImageUrl} onChange={e => setForm(v => ({ ...v, coverImageUrl: e.target.value }))} className="input-internal" placeholder="https://..." /></Field>
          <Field label="Tanggal Publish"><input type="datetime-local" value={form.publishedAt} onChange={e => setForm(v => ({ ...v, publishedAt: e.target.value }))} className="input-internal" /></Field>
          <Field label="Estimasi baca (menit)"><input type="number" min="1" value={form.readTime} onChange={e => setForm(v => ({ ...v, readTime: Number(e.target.value) }))} className="input-internal" /></Field>
          <Field label="Status"><select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value as FormState['status'] }))} className="input-internal"><option value="draft">Draft</option><option value="published">Published</option></select></Field>
        </div>
        <div className="mt-4"><Field label="Ringkasan"><textarea required rows={3} value={form.excerpt} onChange={e => setForm(v => ({ ...v, excerpt: e.target.value }))} className="input-internal py-3" /></Field></div>
        <div className="mt-4"><Field label="Isi Artikel"><textarea required rows={12} value={form.content} onChange={e => setForm(v => ({ ...v, content: e.target.value }))} className="input-internal py-3 font-mono text-xs" placeholder={'Gunakan format sederhana:\n## Judul Bagian\nIsi paragraf...'} /><p className="mt-1 text-[11px] text-slate-400">Gunakan <code>## Judul Bagian</code> untuk membuat section dan daftar isi otomatis pada layout artikel.</p></Field></div>
        {message ? <div className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-xs text-primary">{message}</div> : null}
        <button type="submit" disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={17} />{saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Tambah Artikel'}</button>
      </form>

      <div className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4"><h2 className="text-lg font-bold text-primary">Data Artikel</h2></div>
        {loading ? <div className="p-8 text-sm text-text-muted">Memuat data...</div> : rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Judul</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Publish</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{rows.map(row => <tr key={row.id}><td className="px-5 py-4"><strong className="block text-primary">{row.title}</strong><span className="text-[11px] text-slate-400">/{row.slug}</span></td><td className="px-5 py-4 text-xs">{row.category}</td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${row.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{row.status}</span></td><td className="px-5 py-4 text-xs text-slate-500">{new Date(row.published_at).toLocaleDateString('id-ID')}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => edit(row)} className="rounded-md border border-slate-300 p-2 text-primary" aria-label="Edit"><Edit3 size={15} /></button><button type="button" onClick={() => remove(row.id)} className="rounded-md border border-red-200 p-2 text-red-600" aria-label="Hapus"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <div className="p-8 text-sm text-text-muted">Belum ada artikel di MySQL.</div>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>
}
