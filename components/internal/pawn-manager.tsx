'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Search, TestTube2, X } from 'lucide-react'

type Status = 'active' | 'inactive'
type Named = { id: number; name: string; status: Status }
type Product = Named & { slug: string; category_id: number; brand_id: number; category_name: string; brand_name: string; variant_count: number; sort_order: number; description?: string; search_keywords?: string; image_url?: string }
type Variant = { id: number; product_id: number; name: string; api_code: string; default_price?: number | null; internal_note?: string; sort_order: number; status: Status }

const emptyProduct = () => ({ categoryId: '', brandId: '', name: '', slug: '', description: '', searchKeywords: '', imageUrl: '', sortOrder: 0, status: 'active' as Status })
const emptyVariant = (productId = '') => ({ productId, name: '', apiCode: '', defaultPrice: '', internalNote: '', sortOrder: 0, status: 'active' as Status, overrideActiveApiCode: false })

export function PawnManager() {
  const [categories, setCategories] = useState<Named[]>([])
  const [brands, setBrands] = useState<Named[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [status, setStatus] = useState<'all' | Status>('active')
  const [productForm, setProductForm] = useState<any>(emptyProduct)
  const [variantForm, setVariantForm] = useState<any>(emptyVariant)
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const categoryBrandIds = useMemo(() => {
    if (!categoryId) return new Set<number>()
    return new Set(products.filter(p => p.category_id === Number(categoryId)).map(p => p.brand_id))
  }, [categoryId, products])

  const filteredBrands = useMemo(() => {
    if (!categoryId) return brands
    return brands.filter(brand => categoryBrandIds.has(Number(brand.id)))
  }, [brands, categoryBrandIds, categoryId])

  const productFormBrandOptions = useMemo(() => {
    if (!productForm.categoryId) return brands
    const categoryProductBrandIds = new Set(products.filter(p => p.category_id === Number(productForm.categoryId)).map(p => p.brand_id))
    return brands.filter(brand => categoryProductBrandIds.has(Number(brand.id)))
  }, [brands, productForm.categoryId, products])

  async function load() {
    setLoading(true)
    const [c, b, p] = await Promise.all(['categories', 'brands', 'products'].map(x => fetch(`/api/internal/pawn/${x}`, { cache: 'no-store' }).then(r => r.json())))
    setCategories(c.data || [])
    setBrands(b.data || [])
    setProducts(p.data || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!categoryId) return
    const validBrandExists = filteredBrands.some(brand => String(brand.id) === String(brandId))
    if (brandId && !validBrandExists) setBrandId('')
  }, [brandId, categoryId, filteredBrands])

  useEffect(() => {
    if (selected) closeSelectedDetail()
  }, [categoryId, brandId])

  const visible = useMemo(() => products.filter(p => {
    const q = query.trim().toLowerCase()
    return (!q || [p.name, p.slug, p.brand_name, p.category_name].some(x => x.toLowerCase().includes(q))) &&
      (!categoryId || p.category_id === Number(categoryId)) &&
      (!brandId || p.brand_id === Number(brandId)) &&
      (status === 'all' || p.status === status)
  }), [products, query, categoryId, brandId, status])

  function closeSelectedDetail() {
    setSelected(null)
    setVariants([])
    setShowVariantForm(false)
    setEditingVariantId(null)
    setVariantForm(emptyVariant())
  }

  async function select(p: Product) {
    if (selected?.id === p.id) {
      closeSelectedDetail()
      return
    }

    setSelected(p)
    setShowVariantForm(false)
    setEditingVariantId(null)
    setVariantForm(emptyVariant(String(p.id)))
    const response = await fetch(`/api/internal/pawn/products/${p.id}`, { cache: 'no-store' }).then(r => r.json())
    setVariants(response.data?.variants || [])
  }

  function editProduct(p: Product) {
    setEditingProductId(p.id)
    setProductForm({
      categoryId: String(p.category_id),
      brandId: String(p.brand_id),
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      searchKeywords: p.search_keywords || '',
      imageUrl: p.image_url || '',
      sortOrder: p.sort_order,
      status: p.status,
    })
    setShowProductForm(true)
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault()
    const response = await fetch(`/api/internal/pawn/products${editingProductId ? `/${editingProductId}` : ''}`, {
      method: editingProductId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm),
    })
    const data = await response.json()
    setMessage(response.ok ? 'Produk berhasil disimpan.' : data.error || 'Gagal menyimpan produk.')
    if (response.ok) {
      setShowProductForm(false)
      await load()
    }
  }

  async function saveVariant(e: FormEvent) {
    e.preventDefault()
    const response = await fetch(`/api/internal/pawn/variants${editingVariantId ? `/${editingVariantId}` : ''}`, {
      method: editingVariantId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...variantForm,
        defaultPrice: variantForm.defaultPrice === '' ? null : Number(variantForm.defaultPrice),
      }),
    })
    const data = await response.json()
    setMessage(response.ok ? 'Variant berhasil disimpan.' : data.error || 'Gagal menyimpan variant.')
    if (response.ok && selected) {
      setShowVariantForm(false)
      setEditingVariantId(null)
      await select(selected)
      await load()
    }
  }

  async function testApi(apiCode: string) {
    const response = await fetch('/api/internal/pawn/variants/test-api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiCode }),
    })
    const data = await response.json()
    setMessage(response.ok ? (data.success ? `Valid: ${data.data.branch.name}; maksimal cair Rp${Number(data.data.maxCash).toLocaleString('id-ID')}` : data.message || 'API code tidak valid.') : (data.error || 'Test API gagal.'))
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Internal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-primary">Master Barang Gadai</h1>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            setEditingProductId(null)
            setProductForm(emptyProduct())
            setShowProductForm(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus size={17} />Tambah Produk
        </button>
        <label className="relative ml-auto block w-full sm:w-80">
          <Search className="absolute left-3 top-3 text-slate-400" size={17} />
          <input value={query} onChange={e => setQuery(e.target.value)} className="input-internal pl-10" placeholder="Cari produk..." />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Select label="Kategori" value={categoryId} setValue={v => { setCategoryId(v); if (selected) closeSelectedDetail() }} rows={categories} />
        <Select label="Brand" value={brandId} setValue={v => { setBrandId(v); if (selected) closeSelectedDetail() }} rows={filteredBrands} />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Status
          <select value={status} onChange={e => setStatus(e.target.value as 'all' | Status)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-primary">
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {message && <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-primary">{message}</p>}

      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Variant</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(p => (
                <tr key={p.id} className={selected?.id === p.id ? 'bg-orange-50/40' : ''}>
                  <td className="px-5 py-4 font-semibold text-primary">{p.name}</td>
                  <td className="px-5 py-4">{p.brand_name}</td>
                  <td className="px-5 py-4">{p.category_name}</td>
                  <td className="px-5 py-4">{p.variant_count}</td>
                  <td className="px-5 py-4"><Badge status={p.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => select(p)} className="mr-2 text-sm font-bold text-accent">Detail</button>
                    <span className="text-slate-300">/</span>
                    <button onClick={() => editProduct(p)} className="ml-2 text-sm font-bold text-primary">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <p className="p-8 text-center text-sm text-slate-500">Memuat produk...</p> : !visible.length ? <p className="p-8 text-center text-sm text-slate-500">Produk tidak ditemukan.</p> : null}
      </section>

      {selected && (
        <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
            <h2 className="text-lg font-extrabold text-primary">Detail Produk: {selected.name}</h2>
            <button
              onClick={() => {
                setEditingVariantId(null)
                setVariantForm(emptyVariant(String(selected.id)))
                setShowVariantForm(true)
              }}
              className="ml-auto inline-flex items-center gap-1 rounded-md border border-accent px-3 py-2 text-xs font-bold text-accent"
            >
              <Plus size={14} />Tambah Variant
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Variant</th>
                  <th className="px-5 py-3">API Code</th>
                  <th className="px-5 py-3">Harga Default</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map(v => (
                  <tr key={v.id}>
                    <td className="px-5 py-4 font-semibold text-primary">{v.name}</td>
                    <td className="px-5 py-4 font-mono text-xs">{v.api_code}</td>
                    <td className="px-5 py-4 text-slate-700">{v.default_price ? `Rp${Number(v.default_price).toLocaleString('id-ID')}` : '-'}</td>
                    <td className="px-5 py-4"><Badge status={v.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingVariantId(v.id)
                          setVariantForm({
                            productId: String(v.product_id),
                            name: v.name,
                            apiCode: v.api_code,
                            defaultPrice: v.default_price ?? '',
                            internalNote: v.internal_note || '',
                            sortOrder: v.sort_order,
                            status: v.status,
                            overrideActiveApiCode: false,
                          })
                          setShowVariantForm(true)
                        }}
                        className="mr-2 inline-flex items-center gap-1 text-sm font-bold text-primary"
                      >
                        <Edit3 size={14} />Edit
                      </button>
                      <span className="text-slate-300">/</span>
                      <button onClick={() => testApi(v.api_code)} className="ml-2 inline-flex items-center gap-1 text-sm font-bold text-accent">
                        <TestTube2 size={14} />Test API
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!variants.length && <p className="p-6 text-sm text-slate-500">Belum ada variant.</p>}
        </section>
      )}

      {showProductForm && <ProductDialog value={productForm} setValue={setProductForm} categories={categories} brands={productFormBrandOptions} title={editingProductId ? 'Edit Produk' : 'Tambah Produk'} close={() => setShowProductForm(false)} submit={saveProduct} />}
      {showVariantForm && <VariantDialog value={variantForm} setValue={setVariantForm} title={editingVariantId ? 'Edit Variant' : 'Tambah Variant'} close={() => setShowVariantForm(false)} submit={saveVariant} />}
    </div>
  )
}

function Select({ label, value, setValue, rows }: { label: string; value: string; setValue: (v: string) => void; rows: Named[] }) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
      {label}
      <select value={value} onChange={e => setValue(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-primary">
        <option value="">Semua</option>
        {rows.map(x => <option value={x.id} key={x.id}>{x.name}</option>)}
      </select>
    </label>
  )
}

function Badge({ status }: { status: Status }) {
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{status === 'active' ? 'Aktif' : 'Inactive'}</span>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>
}

function Dialog({ title, children, close, submit }: { title: string; children: React.ReactNode; close: () => void; submit: (e: FormEvent) => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4">
      <form onSubmit={submit} className="mx-auto my-8 max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-primary">{title}</h2>
          <button type="button" onClick={close} className="rounded p-1 text-slate-500"><X size={20} /></button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={close} className="rounded-lg border px-4 py-2 text-sm font-bold">Batal</button>
          <button className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white">Simpan</button>
        </div>
      </form>
    </div>
  )
}

function ProductDialog({ value, setValue, categories, brands, title, close, submit }: any) {
  return (
    <Dialog title={title} close={close} submit={submit}>
      <Field label="Kategori"><select required value={value.categoryId} onChange={e => setValue((v: any) => ({ ...v, categoryId: e.target.value, brandId: '' }))} className="input-internal"><option value="">Pilih kategori</option>{categories.map((x: Named) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
      <Field label="Brand"><select required value={value.brandId} onChange={e => setValue((v: any) => ({ ...v, brandId: e.target.value }))} className="input-internal"><option value="">Pilih brand</option>{brands.map((x: Named) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></Field>
      <Field label="Nama produk"><input required value={value.name} onChange={e => setValue((v: any) => ({ ...v, name: e.target.value }))} className="input-internal" /></Field>
      <Field label="Slug"><input value={value.slug} onChange={e => setValue((v: any) => ({ ...v, slug: e.target.value }))} className="input-internal" /></Field>
      <Field label="Search keywords"><input value={value.searchKeywords} onChange={e => setValue((v: any) => ({ ...v, searchKeywords: e.target.value }))} className="input-internal" /></Field>
      <Field label="URL gambar"><input value={value.imageUrl} onChange={e => setValue((v: any) => ({ ...v, imageUrl: e.target.value }))} className="input-internal" /></Field>
      <Field label="Urutan"><input type="number" min="0" value={value.sortOrder} onChange={e => setValue((v: any) => ({ ...v, sortOrder: Number(e.target.value) }))} className="input-internal" /></Field>
      <Field label="Status"><select value={value.status} onChange={e => setValue((v: any) => ({ ...v, status: e.target.value }))} className="input-internal"><option value="active">Aktif</option><option value="inactive">Inactive</option></select></Field>
      <div className="md:col-span-2"><Field label="Deskripsi"><textarea value={value.description} onChange={e => setValue((v: any) => ({ ...v, description: e.target.value }))} className="input-internal min-h-24" /></Field></div>
    </Dialog>
  )
}

function VariantDialog({ value, setValue, title, close, submit }: any) {
  return (
    <Dialog title={title} close={close} submit={submit}>
      <Field label="Nama variant"><input required value={value.name} onChange={e => setValue((v: any) => ({ ...v, name: e.target.value }))} className="input-internal" /></Field>
      <Field label="API code"><input required value={value.apiCode} onChange={e => setValue((v: any) => ({ ...v, apiCode: e.target.value }))} className="input-internal" /></Field>
      <Field label="Harga default"><input type="number" min="0" value={value.defaultPrice} onChange={e => setValue((v: any) => ({ ...v, defaultPrice: e.target.value }))} className="input-internal" placeholder="Kosongkan jika belum ada harga default" /></Field>
      <Field label="Urutan"><input type="number" min="0" value={value.sortOrder} onChange={e => setValue((v: any) => ({ ...v, sortOrder: Number(e.target.value) }))} className="input-internal" /></Field>
      <Field label="Status"><select value={value.status} onChange={e => setValue((v: any) => ({ ...v, status: e.target.value }))} className="input-internal"><option value="active">Aktif</option><option value="inactive">Inactive</option></select></Field>
      <div className="md:col-span-2"><Field label="Catatan internal"><textarea value={value.internalNote} onChange={e => setValue((v: any) => ({ ...v, internalNote: e.target.value }))} className="input-internal min-h-24" /></Field></div>
      <label className="md:col-span-2 flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={value.overrideActiveApiCode} onChange={e => setValue((v: any) => ({ ...v, overrideActiveApiCode: e.target.checked }))} />Override API code aktif (khusus super admin)</label>
    </Dialog>
  )
}
