'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown, Edit3, Plus, Search, X } from 'lucide-react'

// ------- Types -------
type Status = 'active' | 'inactive'
type Named = { id: number; name: string; status: Status }
type Product = Named & {
  slug: string
  category_id: number
  brand_id: number
  category_name: string
  brand_name: string
  variant_count: number
  sort_order: number
  description?: string
  search_keywords?: string
  image_url?: string
}
type Variant = {
  id: number
  product_id: number
  name: string
  api_code: string
  default_price?: number | null
  internal_note?: string
  sort_order: number
  status: Status
}

// Helpers
const emptyProduct = () => ({
  categoryId: '', brandId: '', name: '', slug: '', description: '',
  searchKeywords: '', imageUrl: '', sortOrder: 0, status: 'active' as Status,
})
const emptyVariant = (productId = '') => ({
  productId, name: '', apiCode: '', defaultPrice: '', internalNote: '',
  sortOrder: 0, status: 'active' as Status, overrideActiveApiCode: false,
})

export function PawnManager() {
  const [categories, setCategories] = useState<Named[]>([])
  const [brands, setBrands] = useState<Named[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Variant[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [brandId, setBrandId] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | Status>('active')
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
    const cat = categories.find(c => String(c.id) === String(categoryId)) as any
    const fromCat = (cat?.brand_ids ? String(cat.brand_ids).split(',').map(Number) : [])
    const fromProducts = products.filter(p => p.category_id === Number(categoryId)).map(p => p.brand_id)
    return new Set([...fromCat, ...fromProducts])
  }, [categoryId, categories, products])

  const filteredBrands = useMemo(() => {
    if (!categoryId) return brands
    const list = brands.filter(b => categoryBrandIds.has(Number(b.id)))
    return list.length > 0 ? list : brands
  }, [brands, categoryBrandIds, categoryId])

  const productFormBrandOptions = useMemo(() => {
    if (!productForm.categoryId) return brands
    const cat = categories.find(c => String(c.id) === String(productForm.categoryId)) as any
    const fromCat = (cat?.brand_ids ? String(cat.brand_ids).split(',').map(Number) : [])
    const fromProducts = products.filter(p => p.category_id === Number(productForm.categoryId)).map(p => p.brand_id)
    const allowed = new Set([...fromCat, ...fromProducts])
    const list = brands.filter(b => allowed.has(Number(b.id)))
    return list.length > 0 ? list : brands
  }, [brands, productForm.categoryId, categories, products])

  const visible = useMemo(() => products.filter(p => {
    return (
      (!categoryId || p.category_id === Number(categoryId)) &&
      (!brandId || p.brand_id === Number(brandId)) &&
      (filterStatus === 'all' || p.status === filterStatus)
    )
  }), [products, categoryId, brandId, filterStatus])

  // ---- Data load ----
  async function load() {
    setLoading(true)
    const [c, b, p] = await Promise.all(
      ['categories', 'brands', 'products'].map(x =>
        fetch(`/api/internal/pawn/${x}`, { cache: 'no-store' }).then(r => r.json())
      )
    )
    setCategories(c.data || [])
    setBrands(b.data || [])
    setProducts(p.data || [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  useEffect(() => {
    if (!categoryId) return
    const valid = filteredBrands.some(b => String(b.id) === String(brandId))
    if (brandId && !valid) setBrandId('')
  }, [brandId, categoryId, filteredBrands])

  // close detail on filter change
  useEffect(() => {
    if (selected) closeDetail()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, brandId])

  // ---- Detail helpers ----
  function closeDetail() {
    setSelected(null)
    setVariants([])
    setShowVariantForm(false)
    setEditingVariantId(null)
    setVariantForm(emptyVariant())
  }

  const selectProduct = useCallback(async (p: Product) => {
    if (selected?.id === p.id) { closeDetail(); return }
    setSelected(p)
    setShowVariantForm(false)
    setEditingVariantId(null)
    setVariantForm(emptyVariant(String(p.id)))
    const res = await fetch(`/api/internal/pawn/products/${p.id}`, { cache: 'no-store' }).then(r => r.json())
    setVariants(res.data?.variants || [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  function editProduct(p: Product) {
    setEditingProductId(p.id)
    setProductForm({
      categoryId: String(p.category_id), brandId: String(p.brand_id),
      name: p.name, slug: p.slug, description: p.description || '',
      searchKeywords: p.search_keywords || '', imageUrl: p.image_url || '',
      sortOrder: p.sort_order, status: p.status,
    })
    setShowProductForm(true)
  }

  // ---- Form saves ----
  async function saveProduct(e: FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/internal/pawn/products${editingProductId ? `/${editingProductId}` : ''}`, {
      method: editingProductId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productForm),
    })
    const data = await res.json()
    setMessage(res.ok ? 'Produk berhasil disimpan.' : data.error || 'Gagal menyimpan produk.')
    if (res.ok) { setShowProductForm(false); await load() }
  }

  async function saveVariant(e: FormEvent) {
    e.preventDefault()
    const res = await fetch(`/api/internal/pawn/variants${editingVariantId ? `/${editingVariantId}` : ''}`, {
      method: editingVariantId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...variantForm,
        defaultPrice: variantForm.defaultPrice === '' ? null : Number(variantForm.defaultPrice),
      }),
    })
    const data = await res.json()
    setMessage(res.ok ? 'Variant berhasil disimpan.' : data.error || 'Gagal menyimpan variant.')
    if (res.ok && selected) {
      setShowVariantForm(false)
      setEditingVariantId(null)
      await selectProduct(selected)
      await load()
    }
  }

  // ---- Pure-React search + pagination (no jQuery conflict) ----
  const PAGE_SIZE_PRODUCT = 10
  const PAGE_SIZE_VARIANT = 10

  const [productQuery, setProductQuery] = useState('')
  const [productPage, setProductPage] = useState(1)
  const [variantQuery, setVariantQuery] = useState('')
  const [variantPage, setVariantPage] = useState(1)
  const [productSort, setProductSort] = useState<{ col: number; asc: boolean }>({ col: 0, asc: true })
  const [variantSort, setVariantSort] = useState<{ col: number; asc: boolean }>({ col: 0, asc: true })

  // Reset halaman saat filter/data berubah
  useEffect(() => { setProductPage(1) }, [visible, productQuery, productSort])
  useEffect(() => { setVariantPage(1) }, [variants, variantQuery, variantSort])

  const sortedFilteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase()
    let rows = q
      ? visible.filter(p => [p.name, p.brand_name, p.category_name, String(p.variant_count), p.status].some(v => v.toLowerCase().includes(q)))
      : [...visible]

    rows.sort((a, b) => {
      const cols = [a.name, a.brand_name, a.category_name, String(a.variant_count), a.status] as string[]
      const colsB = [b.name, b.brand_name, b.category_name, String(b.variant_count), b.status] as string[]
      const v = cols[productSort.col]?.localeCompare(colsB[productSort.col] ?? '') ?? 0
      return productSort.asc ? v : -v
    })
    return rows
  }, [visible, productQuery, productSort])

  const productTotalPages = Math.max(1, Math.ceil(sortedFilteredProducts.length / PAGE_SIZE_PRODUCT))
  const productPageSafe = Math.min(productPage, productTotalPages)
  const productPageRows = sortedFilteredProducts.slice((productPageSafe - 1) * PAGE_SIZE_PRODUCT, productPageSafe * PAGE_SIZE_PRODUCT)

  const sortedFilteredVariants = useMemo(() => {
    const q = variantQuery.trim().toLowerCase()
    let rows = q
      ? variants.filter(v => [v.name, v.api_code, String(v.default_price ?? ''), v.status].some(x => x.toLowerCase().includes(q)))
      : [...variants]

    rows.sort((a, b) => {
      const cols = [a.name, a.api_code, String(a.default_price ?? ''), a.status] as string[]
      const colsB = [b.name, b.api_code, String(b.default_price ?? ''), b.status] as string[]
      const v = cols[variantSort.col]?.localeCompare(colsB[variantSort.col] ?? '') ?? 0
      return variantSort.asc ? v : -v
    })
    return rows
  }, [variants, variantQuery, variantSort])

  const variantTotalPages = Math.max(1, Math.ceil(sortedFilteredVariants.length / PAGE_SIZE_VARIANT))
  const variantPageSafe = Math.min(variantPage, variantTotalPages)
  const variantPageRows = sortedFilteredVariants.slice((variantPageSafe - 1) * PAGE_SIZE_VARIANT, variantPageSafe * PAGE_SIZE_VARIANT)

  function toggleProductSort(col: number) {
    setProductSort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true })
  }
  function toggleVariantSort(col: number) {
    setVariantSort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true })
  }


  // ---- Render ----
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Internal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-primary">Master Barang Gadai</h1>

      {/* Top bar */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setEditingProductId(null); setProductForm(emptyProduct()); setShowProductForm(true) }}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus size={17} /> Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-3">
        <Select label="Kategori" value={categoryId} setValue={v => { setCategoryId(v); if (selected) closeDetail() }} rows={categories} />
        <Select label="Brand" value={brandId} setValue={v => { setBrandId(v); if (selected) closeDetail() }} rows={filteredBrands} />
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          Status
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as 'all' | Status)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-primary">
            <option value="all">Semua</option>
            <option value="active">Aktif</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </div>

      {message && <p className="mt-4 rounded-lg bg-slate-100 px-4 py-3 text-sm text-primary">{message}</p>}

      {/* ── Tabel Produk (React search + sort + pagination) ── */}
      <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Search bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            type="text"
            value={productQuery}
            onChange={e => setProductQuery(e.target.value)}
            placeholder="Cari nama produk, brand, kategori…"
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-primary outline-none placeholder:text-slate-400"
          />
          {productQuery && (
            <button onClick={() => setProductQuery('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          )}
          <span className="ml-2 text-xs text-slate-400">{sortedFilteredProducts.length} produk</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Memuat produk…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {(['Produk', 'Brand', 'Kategori', 'Variant', 'Status'] as const).map((label, i) => (
                    <th
                      key={label}
                      onClick={() => toggleProductSort(i)}
                      className={`cursor-pointer select-none px-4 py-3 ${i === 3 ? 'text-center' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {productSort.col === i
                          ? productSort.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                          : <ChevronsUpDown size={12} className="opacity-30" />}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPageRows.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">Produk tidak ditemukan.</td></tr>
                ) : productPageRows.map(p => (
                  <tr
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`cursor-pointer transition hover:bg-orange-50/60 ${selected?.id === p.id ? 'bg-orange-50/40' : ''}`}
                  >
                    <td className="px-4 py-3 font-semibold text-primary">{p.name}</td>
                    <td className="px-4 py-3 text-slate-700">{p.brand_name}</td>
                    <td className="px-4 py-3 text-slate-700">{p.category_name}</td>
                    <td className="px-4 py-3 text-center">{p.variant_count}</td>
                    <td className="px-4 py-3"><Badge status={p.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={e => { e.stopPropagation(); editProduct(p) }}
                        className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-accent"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination produk */}
        {productTotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>
              Halaman {productPageSafe} / {productTotalPages}
              &nbsp;·&nbsp;
              {(productPageSafe - 1) * 10 + 1}–{Math.min(productPageSafe * 10, sortedFilteredProducts.length)} dari {sortedFilteredProducts.length}
            </span>
            <div className="flex gap-1">
              <PagBtn onClick={() => setProductPage(1)} disabled={productPageSafe <= 1}>«</PagBtn>
              <PagBtn onClick={() => setProductPage(p => Math.max(1, p - 1))} disabled={productPageSafe <= 1}>‹</PagBtn>
              <PagBtn onClick={() => setProductPage(p => Math.min(productTotalPages, p + 1))} disabled={productPageSafe >= productTotalPages}>›</PagBtn>
              <PagBtn onClick={() => setProductPage(productTotalPages)} disabled={productPageSafe >= productTotalPages}>»</PagBtn>
            </div>
          </div>
        )}
        <p className="px-4 pb-3 pt-1 text-xs text-slate-400">☝ Klik baris untuk melihat detail &amp; variant produk.</p>
      </section>

      {/* ── Detail Produk + Tabel Variant ── */}
      {selected && (
        <section className="mt-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Detail header */}
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-accent">Detail Produk</p>
              <h2 className="mt-0.5 text-lg font-extrabold text-primary">{selected.name}</h2>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => editProduct(selected)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-primary hover:border-accent hover:text-accent"
              >
                <Edit3 size={14} /> Edit Produk
              </button>
              <button
                onClick={() => { setEditingVariantId(null); setVariantForm(emptyVariant(String(selected.id))); setShowVariantForm(true) }}
                className="inline-flex items-center gap-1 rounded-md border border-accent px-3 py-2 text-xs font-bold text-accent"
              >
                <Plus size={14} /> Tambah Variant
              </button>
              <button onClick={closeDetail} className="rounded p-1 text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Info ringkas produk */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 border-b border-slate-100 px-5 py-4 text-sm md:grid-cols-4">
            <div><span className="block text-xs text-slate-400">Kategori</span><span className="font-semibold text-primary">{selected.category_name}</span></div>
            <div><span className="block text-xs text-slate-400">Brand</span><span className="font-semibold text-primary">{selected.brand_name}</span></div>
            <div><span className="block text-xs text-slate-400">Slug</span><span className="font-mono text-xs text-slate-600">{selected.slug}</span></div>
            <div><span className="block text-xs text-slate-400">Status</span><Badge status={selected.status} /></div>
            {selected.description && (
              <div className="col-span-2 md:col-span-4">
                <span className="block text-xs text-slate-400">Deskripsi</span>
                <p className="text-slate-600">{selected.description}</p>
              </div>
            )}
          </div>

          {/* Search variant */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={variantQuery}
              onChange={e => setVariantQuery(e.target.value)}
              placeholder="Cari variant, API code…"
              className="min-w-0 flex-1 bg-transparent py-1 text-sm text-primary outline-none placeholder:text-slate-400"
            />
            {variantQuery && (
              <button onClick={() => setVariantQuery('')} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
            )}
          </div>

          {/* Tabel Variant */}
          <div className="overflow-x-auto">
            {variants.length === 0 ? (
              <p className="py-4 px-4 text-sm text-slate-500">Belum ada variant untuk produk ini.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    {(['Variant', 'API Code', 'Harga Default', 'Status'] as const).map((label, i) => (
                      <th
                        key={label}
                        onClick={() => toggleVariantSort(i)}
                        className="cursor-pointer select-none px-4 py-3"
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          {variantSort.col === i
                            ? variantSort.asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                            : <ChevronsUpDown size={12} className="opacity-30" />}
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {variantPageRows.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-400">Variant tidak ditemukan.</td></tr>
                  ) : variantPageRows.map(v => (
                    <tr key={v.id}>
                      <td className="px-4 py-3 font-semibold text-primary">{v.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{v.api_code}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {v.default_price ? `Rp${Number(v.default_price).toLocaleString('id-ID')}` : '—'}
                      </td>
                      <td className="px-4 py-3"><Badge status={v.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingVariantId(v.id)
                            setVariantForm({
                              productId: String(v.product_id), name: v.name,
                              apiCode: v.api_code, defaultPrice: v.default_price ?? '',
                              internalNote: v.internal_note || '', sortOrder: v.sort_order,
                              status: v.status, overrideActiveApiCode: false,
                            })
                            setShowVariantForm(true)
                          }}
                          className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-accent"
                        >
                          <Edit3 size={14} /> Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination variant */}
          {variantTotalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
              <span>Halaman {variantPageSafe} / {variantTotalPages}</span>
              <div className="flex gap-1">
                <PagBtn onClick={() => setVariantPage(1)} disabled={variantPageSafe <= 1}>«</PagBtn>
                <PagBtn onClick={() => setVariantPage(p => Math.max(1, p - 1))} disabled={variantPageSafe <= 1}>‹</PagBtn>
                <PagBtn onClick={() => setVariantPage(p => Math.min(variantTotalPages, p + 1))} disabled={variantPageSafe >= variantTotalPages}>›</PagBtn>
                <PagBtn onClick={() => setVariantPage(variantTotalPages)} disabled={variantPageSafe >= variantTotalPages}>»</PagBtn>
              </div>
            </div>
          )}
        </section>
      )}


      {showProductForm && (
        <ProductDialog
          value={productForm} setValue={setProductForm}
          categories={categories} brands={productFormBrandOptions}
          title={editingProductId ? 'Edit Produk' : 'Tambah Produk'}
          close={() => setShowProductForm(false)} submit={saveProduct}
        />
      )}
      {showVariantForm && (
        <VariantDialog
          value={variantForm} setValue={setVariantForm}
          title={editingVariantId ? 'Edit Variant' : 'Tambah Variant'}
          close={() => setShowVariantForm(false)} submit={saveVariant}
        />
      )}
    </div>
  )
}

// ---- Sub-components ----

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

function PagBtn({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-30 hover:not-disabled:border-accent hover:not-disabled:text-accent"
    >
      {children}
    </button>
  )
}


function Badge({ status }: { status: Status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      {status === 'active' ? 'Aktif' : 'Inactive'}
    </span>
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
      <Field label="Kategori">
        <select required value={value.categoryId} onChange={e => setValue((v: any) => ({ ...v, categoryId: e.target.value, brandId: '' }))} className="input-internal">
          <option value="">Pilih kategori</option>
          {categories.map((x: Named) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </Field>
      <Field label="Brand">
        <select required value={value.brandId} onChange={e => setValue((v: any) => ({ ...v, brandId: e.target.value }))} className="input-internal">
          <option value="">Pilih brand</option>
          {brands.map((x: Named) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </select>
      </Field>
      <Field label="Nama produk"><input required value={value.name} onChange={e => setValue((v: any) => ({ ...v, name: e.target.value }))} className="input-internal" /></Field>
      <Field label="Slug"><input value={value.slug} onChange={e => setValue((v: any) => ({ ...v, slug: e.target.value }))} className="input-internal" /></Field>
      <Field label="Search keywords"><input value={value.searchKeywords} onChange={e => setValue((v: any) => ({ ...v, searchKeywords: e.target.value }))} className="input-internal" /></Field>
      <Field label="URL gambar"><input value={value.imageUrl} onChange={e => setValue((v: any) => ({ ...v, imageUrl: e.target.value }))} className="input-internal" /></Field>
      <Field label="Urutan"><input type="number" min="0" value={value.sortOrder} onChange={e => setValue((v: any) => ({ ...v, sortOrder: Number(e.target.value) }))} className="input-internal" /></Field>
      <Field label="Status">
        <select value={value.status} onChange={e => setValue((v: any) => ({ ...v, status: e.target.value }))} className="input-internal">
          <option value="active">Aktif</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
      <div className="md:col-span-2">
        <Field label="Deskripsi"><textarea value={value.description} onChange={e => setValue((v: any) => ({ ...v, description: e.target.value }))} className="input-internal min-h-24" /></Field>
      </div>
    </Dialog>
  )
}

function VariantDialog({ value, setValue, title, close, submit }: any) {
  return (
    <Dialog title={title} close={close} submit={submit}>
      <Field label="Nama variant"><input required value={value.name} onChange={e => setValue((v: any) => ({ ...v, name: e.target.value }))} className="input-internal" placeholder="Contoh: 128GB, Pro 256GB" /></Field>
      <Field label="API code (opsional)"><input value={value.apiCode} onChange={e => setValue((v: any) => ({ ...v, apiCode: e.target.value }))} className="input-internal" placeholder="Contoh: IP_11_128GB_IBOX" /></Field>
      <Field label="Harga manual / default (Rp)"><input type="number" min="0" value={value.defaultPrice} onChange={e => setValue((v: any) => ({ ...v, defaultPrice: e.target.value }))} className="input-internal" placeholder="Contoh: 4000000 (digunakan jika API tidak diisi)" /></Field>
      <Field label="Urutan"><input type="number" min="0" value={value.sortOrder} onChange={e => setValue((v: any) => ({ ...v, sortOrder: Number(e.target.value) }))} className="input-internal" /></Field>
      <Field label="Status">
        <select value={value.status} onChange={e => setValue((v: any) => ({ ...v, status: e.target.value }))} className="input-internal">
          <option value="active">Aktif</option>
          <option value="inactive">Inactive</option>
        </select>
      </Field>
      <div className="md:col-span-2">
        <Field label="Catatan internal"><textarea value={value.internalNote} onChange={e => setValue((v: any) => ({ ...v, internalNote: e.target.value }))} className="input-internal min-h-24" /></Field>
      </div>
      <label className="md:col-span-2 flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={value.overrideActiveApiCode} onChange={e => setValue((v: any) => ({ ...v, overrideActiveApiCode: e.target.checked }))} />
        Override API code aktif (khusus super admin)
      </label>
    </Dialog>
  )
}
