'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Edit3,
  Layers,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

// ------- Types -------
type Status = 'active' | 'inactive'

type CategoryItem = {
  id: number
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  status: Status
  product_count: number
  brand_count: number
  brand_names?: string | null
  brand_ids?: string | null
}

type BrandItem = {
  id: number
  name: string
  slug: string
  logo_url: string | null
  sort_order: number
  status: Status
  product_count: number
  category_count: number
  category_names?: string | null
  category_ids?: string | null
}

const emptyCategoryForm = () => ({
  name: '',
  slug: '',
  imageUrl: '',
  sortOrder: 0,
  status: 'active' as Status,
  selectedBrandIds: [] as number[],
  newBrandNamesText: '',
})

const emptyBrandForm = () => ({
  name: '',
  slug: '',
  logoUrl: '',
  sortOrder: 0,
  status: 'active' as Status,
  selectedCategoryIds: [] as number[],
})

export function CategoryBrandManager() {
  const [activeTab, setActiveTab] = useState<'category' | 'brand'>('category')
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null)
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm())

  const [showBrandModal, setShowBrandModal] = useState(false)
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null)
  const [brandForm, setBrandForm] = useState(emptyBrandForm())

  const [deleteTarget, setDeleteTarget] = useState<{ type: 'category' | 'brand'; item: CategoryItem | BrandItem } | null>(null)

  // Selected Category for quick inspection
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null)

  // ---- Data Loading ----
  async function loadData() {
    setLoading(true)
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch('/api/internal/pawn/categories', { cache: 'no-store' }).then(r => r.json()),
        fetch('/api/internal/pawn/brands', { cache: 'no-store' }).then(r => r.json()),
      ])
      setCategories(catRes.data || [])
      setBrands(brandRes.data || [])
    } catch {
      setMessage({ type: 'error', text: 'Gagal memuat data kategori dan brand.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  function showToast(text: string, type: 'success' | 'error' = 'success') {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  // Auto generate slug from name
  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 140)
  }

  // ---- Handlers: Category ----
  function openAddCategory() {
    setEditingCategoryId(null)
    setCategoryForm(emptyCategoryForm())
    setShowCategoryModal(true)
  }

  function openEditCategory(cat: CategoryItem) {
    setEditingCategoryId(cat.id)
    const existingBrandIds = cat.brand_ids
      ? cat.brand_ids.split(',').map(s => Number(s.trim())).filter(id => Number.isSafeInteger(id) && id > 0)
      : []
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image_url || '',
      sortOrder: cat.sort_order,
      status: cat.status,
      selectedBrandIds: existingBrandIds,
      newBrandNamesText: '',
    })
    setShowCategoryModal(true)
  }

  async function handleSaveCategory(e: FormEvent) {
    e.preventDefault()
    const isEdit = editingCategoryId !== null
    const newBrands = categoryForm.newBrandNamesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || autoSlug(categoryForm.name),
      imageUrl: categoryForm.imageUrl || null,
      sortOrder: Number(categoryForm.sortOrder) || 0,
      status: categoryForm.status,
      selectedBrandIds: categoryForm.selectedBrandIds,
      newBrands,
    }

    try {
      const res = await fetch(
        `/api/internal/pawn/categories${isEdit ? `/${editingCategoryId}` : ''}`,
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (res.ok) {
        showToast(isEdit ? 'Kategori dan relasi brand berhasil diperbarui.' : 'Kategori baru berhasil ditambahkan.')
        setShowCategoryModal(false)
        await loadData()
      } else {
        showToast(data.error || 'Gagal menyimpan kategori.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan kategori.', 'error')
    }
  }

  // ---- Handlers: Brand ----
  function openAddBrand() {
    setEditingBrandId(null)
    setBrandForm(emptyBrandForm())
    setShowBrandModal(true)
  }

  function openEditBrand(brand: BrandItem) {
    setEditingBrandId(brand.id)
    const existingCategoryIds = brand.category_ids
      ? brand.category_ids.split(',').map(s => Number(s.trim())).filter(id => Number.isSafeInteger(id) && id > 0)
      : []
    setBrandForm({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url || '',
      sortOrder: brand.sort_order,
      status: brand.status,
      selectedCategoryIds: existingCategoryIds,
    })
    setShowBrandModal(true)
  }

  async function handleSaveBrand(e: FormEvent) {
    e.preventDefault()
    const isEdit = editingBrandId !== null
    const payload = {
      name: brandForm.name,
      slug: brandForm.slug || autoSlug(brandForm.name),
      logoUrl: brandForm.logoUrl || null,
      sortOrder: Number(brandForm.sortOrder) || 0,
      status: brandForm.status,
      selectedCategoryIds: brandForm.selectedCategoryIds,
    }

    try {
      const res = await fetch(
        `/api/internal/pawn/brands${isEdit ? `/${editingBrandId}` : ''}`,
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (res.ok) {
        showToast(isEdit ? 'Brand berhasil diperbarui.' : 'Brand baru berhasil ditambahkan.')
        setShowBrandModal(false)
        await loadData()
      } else {
        showToast(data.error || 'Gagal menyimpan brand.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan saat menyimpan brand.', 'error')
    }
  }

  // ---- Handlers: Delete ----
  async function confirmDelete() {
    if (!deleteTarget) return
    const { type, item } = deleteTarget
    const endpoint = `/api/internal/pawn/${type === 'category' ? 'categories' : 'brands'}/${item.id}`

    try {
      const res = await fetch(endpoint, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        showToast(`${type === 'category' ? 'Kategori' : 'Brand'} "${item.name}" berhasil dihapus.`)
        setDeleteTarget(null)
        if (selectedCategory?.id === item.id) setSelectedCategory(null)
        await loadData()
      } else {
        showToast(data.error || 'Gagal menghapus data.', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan saat menghapus data.', 'error')
    }
  }

  // ---- DataTables Pure-React Logic: Category Tab ----
  const [categoryQuery, setCategoryQuery] = useState('')
  const [categoryStatusFilter, setCategoryStatusFilter] = useState<'all' | Status>('all')
  const [categoryPage, setCategoryPage] = useState(1)
  const [categorySort, setCategorySort] = useState<{ col: string; asc: boolean }>({ col: 'sort_order', asc: true })
  const PAGE_SIZE_CAT = 10

  const filteredCategories = useMemo(() => {
    let list = [...categories]
    if (categoryStatusFilter !== 'all') {
      list = list.filter(c => c.status === categoryStatusFilter)
    }
    const q = categoryQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.brand_names || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let valA: any = a[categorySort.col as keyof CategoryItem]
      let valB: any = b[categorySort.col as keyof CategoryItem]
      if (typeof valA === 'string') {
        const res = (valA || '').localeCompare(valB || '')
        return categorySort.asc ? res : -res
      }
      valA = Number(valA || 0)
      valB = Number(valB || 0)
      return categorySort.asc ? valA - valB : valB - valA
    })
    return list
  }, [categories, categoryStatusFilter, categoryQuery, categorySort])

  const catTotalPages = Math.max(1, Math.ceil(filteredCategories.length / PAGE_SIZE_CAT))
  const catSafePage = Math.min(categoryPage, catTotalPages)
  const catPageRows = filteredCategories.slice((catSafePage - 1) * PAGE_SIZE_CAT, catSafePage * PAGE_SIZE_CAT)

  function toggleCatSort(col: string) {
    setCategorySort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true })
  }

  // ---- DataTables Pure-React Logic: Brand Tab ----
  const [brandQuery, setBrandQuery] = useState('')
  const [brandCategoryFilter, setBrandCategoryFilter] = useState<string>('all')
  const [brandStatusFilter, setBrandStatusFilter] = useState<'all' | Status>('all')
  const [brandPage, setBrandPage] = useState(1)
  const [brandSort, setBrandSort] = useState<{ col: string; asc: boolean }>({ col: 'sort_order', asc: true })
  const PAGE_SIZE_BRAND = 10

  const filteredBrands = useMemo(() => {
    let list = [...brands]
    if (brandStatusFilter !== 'all') {
      list = list.filter(b => b.status === brandStatusFilter)
    }
    if (brandCategoryFilter !== 'all') {
      list = list.filter(b => {
        const catIds = (b.category_ids || '').split(',').map(s => s.trim())
        return catIds.includes(brandCategoryFilter)
      })
    }
    const q = brandQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.category_names || '').toLowerCase().includes(q)
      )
    }
    list.sort((a, b) => {
      let valA: any = a[brandSort.col as keyof BrandItem]
      let valB: any = b[brandSort.col as keyof BrandItem]
      if (typeof valA === 'string') {
        const res = (valA || '').localeCompare(valB || '')
        return brandSort.asc ? res : -res
      }
      valA = Number(valA || 0)
      valB = Number(valB || 0)
      return brandSort.asc ? valA - valB : valB - valA
    })
    return list
  }, [brands, brandStatusFilter, brandCategoryFilter, brandQuery, brandSort])

  const brandTotalPages = Math.max(1, Math.ceil(filteredBrands.length / PAGE_SIZE_BRAND))
  const brandSafePage = Math.min(brandPage, brandTotalPages)
  const brandPageRows = filteredBrands.slice((brandSafePage - 1) * PAGE_SIZE_BRAND, brandSafePage * PAGE_SIZE_BRAND)

  function toggleBrandSort(col: string) {
    setBrandSort(prev => prev.col === col ? { col, asc: !prev.asc } : { col, asc: true })
  }

  // Summary Metrics
  const totalCategories = categories.length
  const totalActiveCategories = categories.filter(c => c.status === 'active').length
  const totalBrands = brands.length
  const totalActiveBrands = brands.filter(b => b.status === 'active').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Internal Management</p>
        <h1 className="mt-1 text-3xl font-extrabold text-primary">Master Kategori & Brand</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola master kategori barang gadai dan merek (brand) yang terintegrasi langsung dengan Master Barang & Simulasi.
        </p>
      </div>

      {/* Toast Notification */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm shadow-sm transition ${
            message.type === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-70 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Kategori</p>
              <p className="text-xl font-bold text-slate-800">{totalCategories}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{totalActiveCategories} kategori aktif</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Tag size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Brand</p>
              <p className="text-xl font-bold text-slate-800">{totalBrands}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">{totalActiveBrands} brand aktif</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Kategori Aktif</p>
              <p className="text-xl font-bold text-slate-800">{totalActiveCategories}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 font-medium">Siap disimulasikan</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Layers size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Relasi Produk</p>
              <p className="text-xl font-bold text-slate-800">
                {categories.reduce((acc, c) => acc + Number(c.product_count || 0), 0)}
              </p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Terhubung di MySQL</p>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('category'); setSelectedCategory(null) }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
              activeTab === 'category'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={18} />
            <span>Master Kategori</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => { setActiveTab('brand'); setSelectedCategory(null) }}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
              activeTab === 'brand'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag size={18} />
            <span>Master Brand</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {brands.length}
            </span>
          </button>
        </div>

        <div>
          {activeTab === 'category' ? (
            <button
              onClick={openAddCategory}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
            >
              <Plus size={16} />
              <span>Tambah Kategori</span>
            </button>
          ) : (
            <button
              onClick={openAddBrand}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
            >
              <Plus size={16} />
              <span>Tambah Brand</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENT: KATEGORI */}
      {activeTab === 'category' && (
        <div className="space-y-4">
          {/* DataTables Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={categoryQuery}
                onChange={e => { setCategoryQuery(e.target.value); setCategoryPage(1) }}
                placeholder="Cari kategori, slug, atau brand..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Status:</span>
                <select
                  value={categoryStatusFilter}
                  onChange={e => { setCategoryStatusFilter(e.target.value as any); setCategoryPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif Saja</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* DataTable Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="w-16 px-4 py-3 text-center">Icon</th>
                    <th
                      onClick={() => toggleCatSort('name')}
                      className="cursor-pointer px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Kategori</span>
                        {categorySort.col === 'name' ? (
                          categorySort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleCatSort('slug')}
                      className="cursor-pointer px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1">
                        <span>Slug</span>
                        {categorySort.col === 'slug' ? (
                          categorySort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3">Brand Terkait</th>
                    <th
                      onClick={() => toggleCatSort('product_count')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Produk</span>
                        {categorySort.col === 'product_count' ? (
                          categorySort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleCatSort('sort_order')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Urutan</span>
                        {categorySort.col === 'sort_order' ? (
                          categorySort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleCatSort('status')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Status</span>
                        {categorySort.col === 'status' ? (
                          categorySort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="w-28 px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Memuat data kategori...
                      </td>
                    </tr>
                  ) : catPageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada kategori yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    catPageRows.map(cat => {
                      const isSelected = selectedCategory?.id === cat.id
                      const brandList = cat.brand_names
                        ? cat.brand_names.split(',').map(s => s.trim()).filter(Boolean)
                        : []

                      return (
                        <tr
                          key={cat.id}
                          onClick={() => setSelectedCategory(isSelected ? null : cat)}
                          className={`cursor-pointer transition hover:bg-blue-50/40 ${
                            isSelected ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center">
                            {cat.image_url ? (
                              <img
                                src={cat.image_url}
                                alt={cat.name}
                                className="mx-auto h-8 w-8 rounded object-contain"
                              />
                            ) : (
                              <span className="text-lg">
                                {cat.name.toLowerCase().includes('laptop') ? '💻' : '📱'}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {cat.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {cat.slug}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {brandList.length > 0 ? (
                                brandList.map(b => (
                                  <span
                                    key={b}
                                    className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100"
                                  >
                                    {b}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs italic text-slate-400">Belum ada brand</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {cat.product_count}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                            {cat.sort_order}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                cat.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {cat.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditCategory(cat)}
                                title="Edit Kategori"
                                className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'category', item: cat })}
                                title="Hapus Kategori"
                                className="rounded p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <strong className="text-slate-700">
                  {filteredCategories.length === 0 ? 0 : (catSafePage - 1) * PAGE_SIZE_CAT + 1}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-700">
                  {Math.min(catSafePage * PAGE_SIZE_CAT, filteredCategories.length)}
                </strong>{' '}
                dari <strong className="text-slate-700">{filteredCategories.length}</strong> kategori
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={catSafePage <= 1}
                  onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: catTotalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCategoryPage(pageNum)}
                    className={`h-7 w-7 rounded font-medium ${
                      pageNum === catSafePage
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={catSafePage >= catTotalPages}
                  onClick={() => setCategoryPage(p => Math.min(catTotalPages, p + 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>

          {/* Category Detail Box */}
          {selectedCategory && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Detail Kategori Terpilih
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">{selectedCategory.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white p-3 border border-blue-100">
                  <p className="text-xs text-slate-500">Slug URL</p>
                  <p className="mt-0.5 font-mono text-sm font-semibold text-slate-800">{selectedCategory.slug}</p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-blue-100">
                  <p className="text-xs text-slate-500">Brand Terdaftar</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">{selectedCategory.brand_count} Brand</p>
                </div>
                <div className="rounded-lg bg-white p-3 border border-blue-100">
                  <p className="text-xs text-slate-500">Total Produk Gadai</p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">{selectedCategory.product_count} Produk</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BRAND */}
      {activeTab === 'brand' && (
        <div className="space-y-4">
          {/* DataTables Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={brandQuery}
                onChange={e => { setBrandQuery(e.target.value); setBrandPage(1) }}
                placeholder="Cari nama brand, slug, atau kategori..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Kategori:</span>
                <select
                  value={brandCategoryFilter}
                  onChange={e => { setBrandCategoryFilter(e.target.value); setBrandPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">Semua Kategori</option>
                  {categories.map(c => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>Status:</span>
                <select
                  value={brandStatusFilter}
                  onChange={e => { setBrandStatusFilter(e.target.value as any); setBrandPage(1) }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif Saja</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* DataTable Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="w-16 px-4 py-3 text-center">Logo</th>
                    <th
                      onClick={() => toggleBrandSort('name')}
                      className="cursor-pointer px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1">
                        <span>Nama Brand</span>
                        {brandSort.col === 'name' ? (
                          brandSort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleBrandSort('slug')}
                      className="cursor-pointer px-4 py-3 transition hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-1">
                        <span>Slug</span>
                        {brandSort.col === 'slug' ? (
                          brandSort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="px-4 py-3">Kategori Terkait</th>
                    <th
                      onClick={() => toggleBrandSort('product_count')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Produk</span>
                        {brandSort.col === 'product_count' ? (
                          brandSort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleBrandSort('sort_order')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Urutan</span>
                        {brandSort.col === 'sort_order' ? (
                          brandSort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th
                      onClick={() => toggleBrandSort('status')}
                      className="cursor-pointer px-4 py-3 text-center transition hover:bg-slate-100"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Status</span>
                        {brandSort.col === 'status' ? (
                          brandSort.asc ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronsUpDown size={14} className="text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="w-28 px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Memuat data brand...
                      </td>
                    </tr>
                  ) : brandPageRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        Tidak ada brand yang sesuai dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    brandPageRows.map(brand => {
                      const catList = brand.category_names
                        ? brand.category_names.split(',').map(s => s.trim()).filter(Boolean)
                        : []

                      return (
                        <tr key={brand.id} className="transition hover:bg-slate-50">
                          <td className="px-4 py-3 text-center">
                            {brand.logo_url ? (
                              <img
                                src={brand.logo_url}
                                alt={brand.name}
                                className="mx-auto h-7 w-7 rounded object-contain"
                              />
                            ) : (
                              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded bg-slate-100 text-xs font-bold text-slate-600">
                                {brand.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {brand.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {brand.slug}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {catList.length > 0 ? (
                                catList.map(c => (
                                  <span
                                    key={c}
                                    className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-100"
                                  >
                                    {c}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs italic text-slate-400">Belum ada kategori</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-slate-700">
                            {brand.product_count}
                          </td>
                          <td className="px-4 py-3 text-center font-mono text-xs text-slate-500">
                            {brand.sort_order}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                brand.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {brand.status === 'active' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openEditBrand(brand)}
                                title="Edit Brand"
                                className="rounded p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-primary"
                              >
                                <Edit3 size={15} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'brand', item: brand })}
                                title="Hapus Brand"
                                className="rounded p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
              <div>
                Menampilkan{' '}
                <strong className="text-slate-700">
                  {filteredBrands.length === 0 ? 0 : (brandSafePage - 1) * PAGE_SIZE_BRAND + 1}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-700">
                  {Math.min(brandSafePage * PAGE_SIZE_BRAND, filteredBrands.length)}
                </strong>{' '}
                dari <strong className="text-slate-700">{filteredBrands.length}</strong> brand
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={brandSafePage <= 1}
                  onClick={() => setBrandPage(p => Math.max(1, p - 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                {Array.from({ length: brandTotalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setBrandPage(pageNum)}
                    className={`h-7 w-7 rounded font-medium ${
                      pageNum === brandSafePage
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  disabled={brandSafePage >= brandTotalPages}
                  onClick={() => setBrandPage(p => Math.min(brandTotalPages, p + 1))}
                  className="rounded border border-slate-200 px-2.5 py-1 font-medium disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Kategori */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={e => {
                    const name = e.target.value
                    setCategoryForm(prev => ({
                      ...prev,
                      name,
                      slug: editingCategoryId ? prev.slug : autoSlug(name),
                    }))
                  }}
                  placeholder="Contoh: Smartphone, Laptop, Tablet, Perhiasan..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={e => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="smartphone"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 font-mono text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Urutan Tampil (Sort Order)</label>
                  <input
                    type="number"
                    value={categoryForm.sortOrder}
                    onChange={e => setCategoryForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Gambar / Icon URL (Opsional)</label>
                  <input
                    type="text"
                    value={categoryForm.imageUrl}
                    onChange={e => setCategoryForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="Contoh: /HP.png atau /LPTP.png"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Status</label>
                  <select
                    value={categoryForm.status}
                    onChange={e => setCategoryForm(prev => ({ ...prev, status: e.target.value as Status }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Opsi Brand Terhubung */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">
                    {editingCategoryId ? 'Hubungkan Brand untuk Kategori Ini' : 'Hubungkan Brand ke Kategori Ini'}
                  </p>
                  <span className="text-[11px] font-semibold text-blue-700">
                    {categoryForm.selectedBrandIds.length} brand dipilih
                  </span>
                </div>
                
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1.5">
                    Klik nama brand yang ingin dihubungkan ke kategori ini:
                  </label>
                  <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-inner">
                    {brands.length === 0 ? (
                      <p className="text-xs italic text-slate-400">Belum ada brand di database. Tambahkan brand baru di bawah.</p>
                    ) : (
                      brands.map(b => {
                        const isChecked = categoryForm.selectedBrandIds.includes(b.id)
                        return (
                          <button
                            type="button"
                            key={b.id}
                            onClick={() => {
                              setCategoryForm(prev => ({
                                ...prev,
                                selectedBrandIds: isChecked
                                  ? prev.selectedBrandIds.filter(id => id !== b.id)
                                  : [...prev.selectedBrandIds, b.id],
                              }))
                            }}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                            }`}
                          >
                            <span className="text-xs">{isChecked ? '✓' : '+'}</span>
                            <span>{b.name}</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="border-t border-blue-100 pt-2.5">
                  <label className="block text-[11px] font-medium text-slate-600">
                    Atau Tambah Brand Baru Sekaligus (Pisahkan dengan koma):
                  </label>
                  <input
                    type="text"
                    value={categoryForm.newBrandNamesText}
                    onChange={e => setCategoryForm(prev => ({ ...prev, newBrandNamesText: e.target.value }))}
                    placeholder="Contoh: Vivo, Oppo, Realme, Infinix"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Brand baru yang dituliskan di atas akan otomatis dibuat dan langsung dihubungkan ke kategori ini.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110"
                >
                  {editingCategoryId ? 'Simpan Perubahan' : 'Buat Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Brand */}
      {showBrandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {editingBrandId ? 'Edit Brand' : 'Tambah Brand Baru'}
              </h3>
              <button
                onClick={() => setShowBrandModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600">
                  Nama Brand <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={e => {
                    const name = e.target.value
                    setBrandForm(prev => ({
                      ...prev,
                      name,
                      slug: editingBrandId ? prev.slug : autoSlug(name),
                    }))
                  }}
                  placeholder="Contoh: Apple, Samsung, Asus, Lenovo..."
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Slug URL</label>
                  <input
                    type="text"
                    required
                    value={brandForm.slug}
                    onChange={e => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="apple"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 font-mono text-xs focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Urutan Tampil</label>
                  <input
                    type="number"
                    value={brandForm.sortOrder}
                    onChange={e => setBrandForm(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Logo URL (Opsional)</label>
                  <input
                    type="text"
                    value={brandForm.logoUrl}
                    onChange={e => setBrandForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="Contoh: /apple.png"
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600">Status</label>
                  <select
                    value={brandForm.status}
                    onChange={e => setBrandForm(prev => ({ ...prev, status: e.target.value as Status }))}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              {/* Hubungkan ke Kategori */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-2">
                <p className="text-xs font-bold text-slate-800">Hubungkan Brand ini ke Kategori:</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => {
                    const isChecked = brandForm.selectedCategoryIds.includes(c.id)
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          setBrandForm(prev => ({
                            ...prev,
                            selectedCategoryIds: isChecked
                              ? prev.selectedCategoryIds.filter(id => id !== c.id)
                              : [...prev.selectedCategoryIds, c.id],
                          }))
                        }}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span>{isChecked ? '✓' : '+'}</span>
                        <span>{c.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBrandModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110"
                >
                  {editingBrandId ? 'Simpan Perubahan' : 'Buat Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                <Trash2 size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hapus {deleteTarget.type === 'category' ? 'Kategori' : 'Brand'}?
              </h3>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              Apakah Anda yakin ingin menghapus {deleteTarget.type === 'category' ? 'kategori' : 'brand'}{' '}
              <strong className="text-slate-900">&quot;{deleteTarget.item.name}&quot;</strong>?
              {Number(deleteTarget.item.product_count || 0) > 0 && (
                <span className="mt-2 block font-semibold text-rose-600">
                  Perhatian: Terdapat {deleteTarget.item.product_count} produk yang masih terkait. Anda harus memindahkan atau menghapus produk terkait terlebih dahulu.
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-rose-600 px-5 py-2 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
