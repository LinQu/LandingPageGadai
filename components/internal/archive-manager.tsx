'use client'

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'

type Row = {
  id: number
  title: string
  slug: string
  description: string
  year: number
  document_type: string
  file_url: string | null
  cover_image_url: string | null
  published_at: string
  status: 'draft' | 'published'
}

type FormState = {
  title: string
  slug: string
  description: string
  year: number
  documentType: string
  fileUrl: string
  coverImageUrl: string
  publishedAt: string
  status: 'draft' | 'published'
}

const emptyForm = (): FormState => ({
  title: '',
  slug: '',
  description: '',
  year: new Date().getFullYear(),
  documentType: 'Laporan Keberlanjutan',
  fileUrl: '',
  coverImageUrl: '',
  publishedAt: new Date().toISOString().slice(0, 16),
  status: 'published',
})

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function ArchiveManager() {
  const [rows, setRows] = useState<Row[]>([])
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Upload states
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [docUploadInfo, setDocUploadInfo] = useState<{ name: string; size?: number } | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverUploadInfo, setCoverUploadInfo] = useState<{ name: string } | null>(null)

  const docInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/internal/archives', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat arsip.')
      setRows(payload.data || [])
    } catch (err: any) {
      setError(err.message || 'Gagal memuat arsip.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function handleTitleChange(e: ChangeEvent<HTMLInputElement>) {
    const nextTitle = e.target.value
    setForm(v => {
      const currentSlugMatchesOldTitle = !v.slug || v.slug === slugifyText(v.title)
      return {
        ...v,
        title: nextTitle,
        slug: currentSlugMatchesOldTitle ? slugifyText(nextTitle) : v.slug,
      }
    })
  }

  async function handleFileUpload(file: File, type: 'document' | 'cover') {
    if (!file) return

    if (type === 'document') {
      setUploadingDoc(true)
      setDocUploadInfo({ name: file.name, size: file.size })
    } else {
      setUploadingCover(true)
      setCoverUploadInfo({ name: file.name })
    }

    setMessage('')
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/internal/archives/upload', {
        method: 'POST',
        body: formData,
      })

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal mengunggah file.')

      if (type === 'document') {
        setForm(v => ({ ...v, fileUrl: payload.fileUrl }))
        setMessage(`File "${file.name}" berhasil diunggah.`)
      } else {
        setForm(v => ({ ...v, coverImageUrl: payload.fileUrl }))
        setMessage(`Gambar cover "${file.name}" berhasil diunggah.`)
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah file.')
      if (type === 'document') setDocUploadInfo(null)
      else setCoverUploadInfo(null)
    } finally {
      if (type === 'document') setUploadingDoc(false)
      else setUploadingCover(false)
    }
  }

  function edit(row: Row) {
    setEditingId(row.id)
    setForm({
      title: row.title,
      slug: row.slug,
      description: row.description,
      year: Number(row.year),
      documentType: row.document_type,
      fileUrl: row.file_url || '',
      coverImageUrl: row.cover_image_url || '',
      publishedAt: new Date(row.published_at).toISOString().slice(0, 16),
      status: row.status,
    })

    if (row.file_url) {
      const fileName = row.file_url.split('/').pop() || 'Dokumen PDF'
      setDocUploadInfo({ name: fileName })
    } else {
      setDocUploadInfo(null)
    }

    if (row.cover_image_url) {
      const coverName = row.cover_image_url.split('/').pop() || 'Cover Image'
      setCoverUploadInfo({ name: coverName })
    } else {
      setCoverUploadInfo(null)
    }

    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setEditingId(null)
    setForm(emptyForm())
    setDocUploadInfo(null)
    setCoverUploadInfo(null)
    if (docInputRef.current) docInputRef.current.value = ''
    if (coverInputRef.current) coverInputRef.current.value = ''
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!form.fileUrl) {
      if (!window.confirm('File PDF belum diunggah. Tetap simpan arsip tanpa file?')) {
        return
      }
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(
        editingId ? `/api/internal/archives/${editingId}` : '/api/internal/archives',
        {
          method: editingId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      )

      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menyimpan arsip.')

      setMessage(editingId ? 'Arsip berhasil diperbarui.' : 'Arsip berhasil dibuat.')
      reset()
      await load()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan arsip.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    if (!window.confirm('Hapus arsip ini dari database?')) return
    setMessage('')
    setError('')

    try {
      const response = await fetch(`/api/internal/archives/${id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menghapus arsip.')
      setMessage('Arsip berhasil dihapus.')
      await load()
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus arsip.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Document Management</p>
          <h1 className="mt-1 text-3xl font-extrabold text-primary">Master Arsip Perusahaan</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-text-muted">
            Kelola dokumen publikasi resmi (Laporan Keberlanjutan &amp; Laporan Keuangan Audited) dengan upload file PDF langsung ke sistem.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2">
            <FileText size={20} className="text-accent" />
            <span>{editingId ? `Edit Arsip #${editingId}` : 'Tambah Arsip Baru'}</span>
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
            >
              <X size={14} /> Batal edit
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Judul Dokumen (Wajib)">
            <input
              required
              value={form.title}
              onChange={handleTitleChange}
              placeholder="Contoh: Laporan Keuangan Audited 2025"
              className="input-internal"
            />
          </Field>

          <Field label="Slug URL">
            <input
              value={form.slug}
              onChange={e => setForm(v => ({ ...v, slug: e.target.value }))}
              placeholder="laporan-keuangan-audited-2025"
              className="input-internal"
            />
          </Field>

          <Field label="Tahun Laporan">
            <input
              type="number"
              min="2000"
              max="2100"
              value={form.year}
              onChange={e => setForm(v => ({ ...v, year: Number(e.target.value) }))}
              className="input-internal"
            />
          </Field>

          <Field label="Jenis Dokumen">
            <select
              value={form.documentType}
              onChange={e => setForm(v => ({ ...v, documentType: e.target.value }))}
              className="input-internal"
            >
              <option value="Laporan Keberlanjutan">Laporan Keberlanjutan</option>
              <option value="Laporan Keuangan">Laporan Keuangan</option>
              <option value="Laporan Tahunan">Laporan Tahunan</option>
              <option value="Dokumen Perusahaan">Dokumen Perusahaan</option>
            </select>
          </Field>

          {/* PDF File Upload Field */}
          <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:p-5">
            <span className="block text-xs font-bold text-slate-700">Upload File Dokumen / PDF (Wajib)</span>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Pilih file PDF dari komputer Anda (Format: .pdf, .doc, .docx - Maksimal 50MB).
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,application/pdf,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'document')
                }}
                className="hidden"
                id="archive-doc-upload"
              />
              <label
                htmlFor="archive-doc-upload"
                className={`inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer ${
                  uploadingDoc ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-dark'
                }`}
              >
                {uploadingDoc ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Mengunggah PDF...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>{form.fileUrl ? 'Ganti File PDF' : 'Pilih File PDF'}</span>
                  </>
                )}
              </label>

              {form.fileUrl ? (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold truncate max-w-xs">{docUploadInfo?.name || form.fileUrl.split('/').pop()}</span>
                  {docUploadInfo?.size ? (
                    <span className="text-[10px] text-emerald-600 font-medium">({formatBytes(docUploadInfo.size)})</span>
                  ) : null}
                  <a
                    href={form.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 inline-flex items-center gap-1 font-bold text-emerald-900 underline hover:text-emerald-950"
                  >
                    <span>Buka File</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(v => ({ ...v, fileUrl: '' }))
                      setDocUploadInfo(null)
                      if (docInputRef.current) docInputRef.current.value = ''
                    }}
                    className="ml-1 text-slate-400 hover:text-red-600 p-0.5"
                    title="Hapus file"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : null}
            </div>

            {/* Path Preview */}
            {form.fileUrl ? (
              <p className="mt-2 text-[10px] text-slate-400 font-mono">
                Lokasi tersimpan: {form.fileUrl}
              </p>
            ) : null}
          </div>

          {/* Cover Image Upload (Optional) */}
          <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
            <span className="block text-xs font-bold text-slate-700">Gambar Cover (Opsional)</span>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(file, 'cover')
                }}
                className="hidden"
                id="archive-cover-upload"
              />
              <label
                htmlFor="archive-cover-upload"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-sm"
              >
                {uploadingCover ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={14} />
                    <span>{form.coverImageUrl ? 'Ganti Cover' : 'Upload Cover'}</span>
                  </>
                )}
              </label>

              {form.coverImageUrl ? (
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700">
                  <span className="truncate max-w-xs">{coverUploadInfo?.name || form.coverImageUrl.split('/').pop()}</span>
                  <a
                    href={form.coverImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline font-bold"
                  >
                    Preview
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(v => ({ ...v, coverImageUrl: '' }))
                      setCoverUploadInfo(null)
                      if (coverInputRef.current) coverInputRef.current.value = ''
                    }}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <Field label="Tanggal Publikasi">
            <input
              type="datetime-local"
              value={form.publishedAt}
              onChange={e => setForm(v => ({ ...v, publishedAt: e.target.value }))}
              className="input-internal"
            />
          </Field>

          <Field label="Status Publikasi">
            <select
              value={form.status}
              onChange={e => setForm(v => ({ ...v, status: e.target.value as FormState['status'] }))}
              className="input-internal"
            >
              <option value="published">Published (Ditampilkan ke Publik)</option>
              <option value="draft">Draft (Disembunyikan)</option>
            </select>
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Deskripsi Ringkas Dokumen (Wajib)">
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
              placeholder="Jelaskan secara ringkas mengenai laporan ini..."
              className="input-internal py-2.5"
            />
          </Field>
        </div>

        {/* Feedback Alerts */}
        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploadingDoc || uploadingCover}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-accent/20 transition hover:brightness-95 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : editingId ? (
              <>
                <Edit3 size={16} />
                <span>Simpan Perubahan</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Tambah Arsip</span>
              </>
            )}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
          ) : null}
        </div>
      </form>

      {/* Table Listing */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-primary">Daftar Dokumen Arsip di MySQL</h2>
            <p className="text-[11px] text-slate-400">Total {rows.length} arsip tercatat di database.</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 size={24} className="animate-spin mx-auto text-primary/40 mb-2" />
            <span>Memuat data arsip...</span>
          </div>
        ) : rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Dokumen</th>
                  <th className="px-5 py-3.5">Tahun</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">File PDF</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                          <FileText size={18} />
                        </div>
                        <div>
                          <strong className="block text-primary font-bold text-sm leading-snug">{row.title}</strong>
                          <span className="text-[11px] text-slate-400">{row.document_type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">{row.year}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          row.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {row.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.file_url ? (
                        <a
                          href={row.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-primary hover:text-accent underline"
                        >
                          <Download size={13} />
                          <span>Download / Lihat</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada file</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => edit(row)}
                          className="rounded-lg border border-slate-200 p-2 text-primary hover:bg-slate-100 hover:border-slate-300 transition shadow-sm"
                          title="Edit arsip"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(row.id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 hover:border-red-300 transition shadow-sm"
                          title="Hapus arsip"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            <FileText size={36} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">Belum ada arsip di database MySQL.</p>
            <p className="mt-1 text-slate-400">Gunakan formulir di atas untuk mengunggah file PDF dan menambahkan arsip baru.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  )
}
