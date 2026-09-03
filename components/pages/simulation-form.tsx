'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
} from 'lucide-react'
import { BranchSelector } from './branch-selector'
import { getBranches } from '../../lib/services/branch.service'
import {
  calculateAdminFee,
  calculateEstimatedMin,
  calculateSewaModal,
  getBarangEstimates,
  type BarangEstimate,
} from '../../lib/services/simulation.service'
import {
  getPawnCatalog,
  type PawnCatalogBrand,
  type PawnCatalogCategory,
  type PawnCatalogProduct,
  type PawnCatalogSpec,
} from '../../lib/services/pawn-catalog.service'
import type { Branch, ItemBrand, ItemSeries, SimulationData } from '../../lib/types'

type SimulationStage = 'setup' | 'brand' | 'product' | 'variant'

type SimulationFormProps = {
  stage: SimulationStage
}

const STORAGE_KEY = 'gadai_simulation_data'

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function getLoanSliderStepCount(min: number, max: number): number {
  if (max <= min) {
    return 0
  }

  return Math.ceil((max - min) / 50000)
}

function getSliderStepFromLoanAmount(amount: number, min: number, max: number): number {
  if (max <= min) {
    return 0
  }

  const boundedAmount = Math.max(min, Math.min(max, amount))
  return Math.round((boundedAmount - min) / 50000)
}

function getLoanAmountFromSliderStep(step: number, min: number, max: number): number {
  if (max <= min) {
    return min
  }

  const calculated = min + step * 50000
  return Math.min(max, calculated)
}

function readStoredSimulation(): Partial<SimulationData> {
  if (typeof window === 'undefined') {
    return {}
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem('simulationData')
  if (!storedValue) {
    return {}
  }

  try {
    return JSON.parse(storedValue) as Partial<SimulationData>
  } catch {
    return {}
  }
}

function SimulationStepProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1">
      {[1, 2, 3, 4].map(step => (
        <div
          key={step}
          className={`h-1.5 sm:h-2 rounded-full transition-colors duration-300 ${
            step <= currentStep ? 'bg-red-600' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  )
}

export function SimulationForm({ stage }: SimulationFormProps) {
  const router = useRouter()
  const [simulation, setSimulation] = useState<Partial<SimulationData>>({})
  const [hydrated, setHydrated] = useState(false)
  const [catalog, setCatalog] = useState<PawnCatalogCategory[]>([])
  const [catalogState, setCatalogState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const [locationMessage, setLocationMessage] = useState('')
  const [estimateMessage, setEstimateMessage] = useState('')
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [apiLoadState, setApiLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [barangEstimates, setBarangEstimates] = useState<BarangEstimate[]>([])
  const [selectedLoanAmount, setSelectedLoanAmount] = useState(0)
  const selectedTenor = 30 as const

  const [branches, setBranches] = useState<Branch[]>([])
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const [brandSearchQuery, setBrandSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [variantSearchQuery, setVariantSearchQuery] = useState('')

  useEffect(() => {
    const stored = readStoredSimulation()
    if (stage === 'setup') {
      // Pertahankan pilihan cabang dan kategori sebelumnya agar tidak hilang saat kembali ke /simulasi
      setSimulation(prev => ({
        ...prev,
        branch: stored.branch || prev.branch,
        branchCode: stored.branchCode || prev.branchCode,
        category: stored.category || prev.category,
      }))
      setHydrated(true)
      return
    }

    setSimulation(stored)
    setHydrated(true)
  }, [stage])

  useEffect(() => {
    let isMounted = true

    const loadCatalog = async () => {
      try {
        setCatalogState('loading')
        const catalogData = await getPawnCatalog()
        if (isMounted) {
          setCatalog(catalogData)
          setCatalogState('loaded')
        }
      } catch {
        if (isMounted) {
          setCatalog([])
          setCatalogState('error')
        }
      }
    }

    void loadCatalog()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!hydrated) {
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(simulation))
    window.localStorage.setItem('simulationData', JSON.stringify(simulation))
  }, [hydrated, simulation])

  const selectedCategoryKey = simulation.category?.kode || ''
  const selectedCategory = useMemo(() => catalog.find(entry => entry.kode === selectedCategoryKey), [catalog, selectedCategoryKey])
  const categoryItems = selectedCategory?.brands || []

  const selectedProduct = useMemo(() => {
    if (!simulation.series?.id) {
      return undefined
    }

    for (const brand of categoryItems) {
      const product = brand.products.find((item: PawnCatalogProduct) => item.id === simulation.series?.id)
      if (product) {
        return product
      }
    }

    return undefined
  }, [categoryItems, simulation.series?.id])

  const selectedSpec = useMemo(() => {
    if (!selectedProduct || !simulation.specification) {
      return undefined
    }

    return selectedProduct.specs.find((spec: PawnCatalogSpec) => spec.label === simulation.specification)
  }, [selectedProduct, simulation.specification])

  const branchCode = simulation.branchCode || simulation.branch?.id || ''
  const selectedNoHp = selectedSpec?.apiCode || selectedSpec?.id || ''

  useEffect(() => {
    if (stage === 'setup') {
      let isMounted = true

      const loadBranches = async (latitude: number, longitude: number) => {
        try {
          const branchesData = await getBranches(latitude, longitude)
          if (isMounted) {
            setBranches(branchesData)
          }
        } catch {
          if (isMounted) {
            setBranches([])
          }
        }
      }

      if (!navigator.geolocation) {
        setLocationMessage('Izinkan akses lokasi untuk menampilkan cabang terdekat.')
        void loadBranches(0, 0)
        return () => {
          isMounted = false
        }
      }

      navigator.geolocation.getCurrentPosition(
        position => {
          if (!isMounted) {
            return
          }

          setLocationMessage('')
          void loadBranches(position.coords.latitude, position.coords.longitude)
        },
        () => {
          if (!isMounted) {
            return
          }

          setLocationMessage('Izinkan akses lokasi untuk menampilkan cabang terdekat.')
          void loadBranches(0, 0)
        }
      )

      return () => {
        isMounted = false
      }
    }

    return undefined
  }, [stage])

  useEffect(() => {
    if (!hydrated || catalogState === 'loading' || catalogState === 'idle') {
      return
    }

    const hasBranch = Boolean(simulation.branch)
    const hasCategory = Boolean(simulation.category)
    const hasBrand = Boolean(simulation.brand)
    const hasProduct = Boolean(simulation.series)
    const hasVariant = Boolean(simulation.specification)

    if (stage === 'brand' && (!hasBranch || !hasCategory || !selectedCategory)) {
      router.replace('/simulasi')
      return
    }

    if (stage === 'product' && (!hasBranch || !hasCategory || !hasBrand || !selectedCategory?.brands.find((b: PawnCatalogBrand) => b.id === simulation.brand?.id))) {
      router.replace('/simulasi/brand')
      return
    }

    if (stage === 'variant' && (!hasBranch || !hasCategory || !hasBrand || !hasProduct || !selectedProduct)) {
      router.replace('/simulasi/produk')
      return
    }

    if (stage === 'setup' && hasVariant) {
      // keep the latest state, but the user can revisit setup if needed
    }
  }, [catalogState, hydrated, router, selectedCategory, selectedProduct, simulation.branch, simulation.brand, simulation.category, simulation.series, simulation.specification, stage])

  const nearestBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      const distanceA = a.distance ?? Number.POSITIVE_INFINITY
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY
      return distanceA - distanceB
    })
  }, [branches])

  const filteredCategories = useMemo(() => {
    const query = categorySearchQuery.trim().toLowerCase()

    if (!query) {
      return catalog
    }

    return catalog.filter(category =>
      [category.name, category.kode, category.brands.map((brand: PawnCatalogBrand) => brand.name).join(' ')].join(' ').toLowerCase().includes(query)
    )
  }, [catalog, categorySearchQuery])

  const brandOptions = useMemo(() => categoryItems, [categoryItems])

  const filteredBrands = useMemo(() => {
    const query = brandSearchQuery.trim().toLowerCase()

    if (!query) {
      return brandOptions
    }

    return brandOptions.filter((option: PawnCatalogBrand) => option.name.toLowerCase().includes(query))
  }, [brandOptions, brandSearchQuery])

  const selectedBrandProducts = useMemo(() => {
    if (!simulation.brand?.id) {
      return []
    }

    const rawProducts = brandOptions.find((option: PawnCatalogBrand) => option.id === simulation.brand?.id)?.products || []
    return rawProducts.filter((item: PawnCatalogProduct) => Array.isArray(item.specs) && item.specs.length > 0)
  }, [brandOptions, simulation.brand?.id])

  const filteredProducts = useMemo(() => {
    const query = productSearchQuery.trim().toLowerCase()

    if (!query) {
      return selectedBrandProducts
    }

    return selectedBrandProducts.filter((item: PawnCatalogProduct) =>
      [item.name, item.summary, ...item.aliases].join(' ').toLowerCase().includes(query)
    )
  }, [productSearchQuery, selectedBrandProducts])

  const filteredVariants = useMemo(() => {
    const query = variantSearchQuery.trim().toLowerCase()

    if (!selectedProduct) {
      return []
    }

    if (!query) {
      return selectedProduct.specs
    }

    return selectedProduct.specs.filter((spec: PawnCatalogSpec) =>
      [spec.label, spec.note || '', spec.id].join(' ').toLowerCase().includes(query)
    )
  }, [selectedProduct, variantSearchQuery])

  const fallbackPriceRange = useMemo(() => {
    if (!selectedSpec) return null
    const raw = selectedSpec.maxValuation
    const maxCash = typeof raw === 'number' && raw > 0 ? raw : 0
    if (maxCash <= 0) return null
    return {
      min: calculateEstimatedMin(maxCash),
      max: maxCash,
      source: 'catalog' as const,
    }
  }, [selectedSpec])

  useEffect(() => {
    if (stage !== 'variant' || !selectedSpec) {
      setBarangEstimates([])
      setApiLoadState('idle')
      setEstimateMessage('')
      setEstimateLoading(false)
      return
    }

    let isMounted = true

    const loadBarangEstimates = async (noHP: string) => {
      try {
        setEstimateLoading(true)
        setApiLoadState('loading')
        setEstimateMessage('')

        const startTime = Date.now()
        let estimates: any[] = []

        if (noHP) {
          estimates = await getBarangEstimates(noHP).catch(() => [])
        }

        // Delay minimal 500ms agar customer melihat status "Memuat harga..." secara halus
        const elapsed = Date.now() - startTime
        if (elapsed < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - elapsed))
        }

        if (!isMounted) return

        setBarangEstimates(estimates)
        setApiLoadState('loaded')

        if (estimates.length === 0 && (!fallbackPriceRange || fallbackPriceRange.max <= 0)) {
          setEstimateMessage('Estimasi taksiran belum tersedia untuk variant ini.')
        } else {
          setEstimateMessage('')
        }
      } catch {
        if (isMounted) {
          setBarangEstimates([])
          setApiLoadState('error')
          if (!fallbackPriceRange || fallbackPriceRange.max <= 0) {
            setEstimateMessage('Estimasi taksiran belum tersedia.')
          } else {
            setEstimateMessage('')
          }
        }
      } finally {
        if (isMounted) {
          setEstimateLoading(false)
        }
      }
    }

    void loadBarangEstimates(selectedNoHp)

    return () => {
      isMounted = false
    }
  }, [fallbackPriceRange, selectedNoHp, selectedSpec, stage, branchCode])

  const selectedBranchEstimate = useMemo(() => {
    if (barangEstimates.length === 0) return undefined
    if (!branchCode) return barangEstimates[0]
    return (
      barangEstimates.find(
        entry => entry.kodeCabang.trim().toLowerCase() === branchCode.trim().toLowerCase()
      ) ?? barangEstimates[0]
    )
  }, [barangEstimates, branchCode])

  const activePriceRange = useMemo(() => {
    if (estimateLoading || apiLoadState === 'loading') {
      return null
    }

    // 1. Prioritaskan harga real-time taksiran jika ada
    if (selectedBranchEstimate && selectedBranchEstimate.maxCash > 0) {
      return {
        min: calculateEstimatedMin(selectedBranchEstimate.maxCash),
        max: selectedBranchEstimate.maxCash,
        source: 'api' as const,
      }
    }

    // 2. Fallback ke harga default produk
    if (fallbackPriceRange && fallbackPriceRange.max > 0) {
      return fallbackPriceRange
    }

    return null
  }, [estimateLoading, apiLoadState, fallbackPriceRange, selectedBranchEstimate])

  const selectedLoanAmountResolved = selectedLoanAmount || activePriceRange?.max || 0
  const sewaModal = calculateSewaModal(selectedLoanAmountResolved, selectedTenor)
  const adminFee = calculateAdminFee(selectedLoanAmountResolved)

  useEffect(() => {
    if (!activePriceRange) {
      return
    }
    const safeMin = activePriceRange.min ?? 0
    const safeMax = activePriceRange.max ?? 0

    setSelectedLoanAmount(prev => {
      if (prev >= safeMin && prev <= safeMax) {
        return prev
      }

      return safeMax
    })
  }, [activePriceRange])

  useEffect(() => {
    if (stage !== 'variant' || !selectedProduct || !activePriceRange || selectedLoanAmountResolved <= 0) {
      return
    }

    setSimulation(prev => ({
      ...prev,
      apiCode: selectedNoHp || prev.apiCode,
      tenor: selectedTenor,
      valuationMin: activePriceRange.min,
      valuationMax: activePriceRange.max,
      estimatedMin: activePriceRange.min,
      estimatedMax: activePriceRange.max,
      loanAmount: selectedLoanAmountResolved,
      valuation: selectedLoanAmountResolved,
      sewaModal,
      adminFee,
    }))
  }, [activePriceRange, adminFee, selectedLoanAmountResolved, selectedNoHp, selectedProduct, selectedTenor, sewaModal, stage])

  const updateSimulation = (updater: (prev: Partial<SimulationData>) => Partial<SimulationData>) => {
    setSimulation((prev: Partial<SimulationData>) => updater(prev))
  }

  const resetEstimateData = () => {
    setBarangEstimates([])
    setApiLoadState('idle')
    setEstimateMessage('')
    setSelectedLoanAmount(0)
  }

  const handleSelectBranch = (branch: Branch) => {
    updateSimulation(prev => ({
      ...prev,
      branch,
      branchCode: branch.id,
      valuationMin: undefined,
      valuationMax: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      loanAmount: undefined,
      valuation: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    resetEstimateData()
  }

  const handleSelectCategory = (category: PawnCatalogCategory) => {
    updateSimulation(prev => ({
      ...prev,
      category: {
        kode: category.kode,
        name: category.name,
        imageUrl: category.imageUrl,
        icon: category.icon,
      },
      brand: undefined,
      series: undefined,
      itemName: undefined,
      variant: undefined,
      specification: undefined,
      apiCode: undefined,
      valuationMin: undefined,
      valuationMax: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      loanAmount: undefined,
      valuation: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    setBrandSearchQuery('')
    setProductSearchQuery('')
    setVariantSearchQuery('')
    resetEstimateData()
  }

  const handleContinueFromSetup = () => {
    if (!simulation.branch || !simulation.category) {
      return
    }

    router.push('/simulasi/brand')
  }

  const handleSelectBrand = (brand: PawnCatalogBrand) => {
    const selectedBrand: ItemBrand = {
      id: brand.id,
      name: brand.name,
      kodekat: selectedCategory?.kode || 'HP',
    }

    updateSimulation(prev => ({
      ...prev,
      brand: selectedBrand,
      series: undefined,
      itemName: undefined,
      variant: undefined,
      specification: undefined,
      apiCode: undefined,
      valuationMin: undefined,
      valuationMax: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      loanAmount: undefined,
      valuation: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    setProductSearchQuery('')
    setVariantSearchQuery('')
    resetEstimateData()
    router.push('/simulasi/produk')
  }

  const handleSelectProduct = (item: PawnCatalogProduct) => {
    const seriesItem: ItemSeries = {
      id: item.id,
      name: item.name,
      brandId: simulation.brand?.id || '',
    }

    updateSimulation(prev => ({
      ...prev,
      series: seriesItem,
      itemName: item.name,
      variant: undefined,
      specification: undefined,
      apiCode: undefined,
      valuationMin: undefined,
      valuationMax: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      loanAmount: undefined,
      valuation: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    setVariantSearchQuery('')
    resetEstimateData()
    router.push('/simulasi/variant')
  }

  const handleSelectVariant = (spec: PawnCatalogSpec) => {
    resetEstimateData()
    setEstimateLoading(true)
    setApiLoadState('loading')

    updateSimulation(prev => ({
      ...prev,
      specification: spec.label,
      apiCode: spec.apiCode || spec.id,
      valuationMin: undefined,
      valuationMax: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      loanAmount: undefined,
      valuation: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))
  }

  const handleProceedToBooking = () => {
    if (selectedLoanAmountResolved && simulation.branch && simulation.category && activePriceRange) {
      const payload = {
        ...simulation,
        valuationMin: activePriceRange.min,
        valuationMax: activePriceRange.max,
        estimatedMin: activePriceRange.min,
        estimatedMax: activePriceRange.max,
        loanAmount: selectedLoanAmountResolved,
        valuation: selectedLoanAmountResolved,
        tenor: selectedTenor,
        sewaModal,
        adminFee,
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      window.localStorage.setItem('simulationData', JSON.stringify(payload))
      router.push('/booking')
    }
  }

  const selectedRangeText = activePriceRange
    ? `${formatCurrency(activePriceRange.min ?? 0)} - ${formatCurrency(activePriceRange.max ?? 0)}`
    : null

  if (!hydrated) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
        Memuat simulasi...
      </div>
    )
  }

  // ==========================================
  // STAGE 1: SETUP (Cabang & Kategori)
  // ==========================================
  if (stage === 'setup') {
    return (
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-white px-4 py-5 sm:px-8 sm:py-8 shadow-sm ring-1 ring-black/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,30,36,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,30,61,0.08),transparent_25%)]" />
          <div className="relative grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-2.5 sm:space-y-4">
              <div className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Taksir Barang Online
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h1 className="max-w-xl text-2xl font-black leading-tight text-primary sm:text-4xl lg:text-5xl">
                  <span className="block">Taksir Nilai Barang</span>
                  <span className="relative inline-block text-accent">
                    Cepat &amp; Transparan
                    
                  </span>
                </h1>
                <p className="max-w-2xl text-xs sm:text-sm leading-normal sm:leading-relaxed text-slate-600">
                  Dapatkan estimasi nilai barang sebelum datang ke cabang. Pilih cabang terdekat dan kategori barang di bawah.
                </p>
              </div>
            </div>

            {/* Visual Graphic */}
            <div className="relative mx-auto hidden w-full max-w-md lg:block">
              <div className="relative rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 p-4 shadow-xl">
                <div className="mx-auto w-[220px] rounded-[1.8rem] border-8 border-slate-950 bg-white p-3 shadow-md">
                  <div className="rounded-[1.4rem] bg-slate-50 p-4">
                    <div className="mx-auto mb-3 h-1.5 w-20 rounded-full bg-slate-200" />
                    <div className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Gadai Sakti</p>
                      <div className="mt-2.5 rounded-xl bg-slate-900 px-3.5 py-2.5 text-right text-white">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-white/60">Estimasi Cair</div>
                        <div className="mt-1 text-xl font-black text-amber-400">Rp 4.016.250</div>
                      </div>
                      <div className="mt-3 flex items-center justify-center rounded-lg bg-emerald-50 py-2 text-xs font-bold text-emerald-700">
                        Proses Cepat &amp; Aman
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Controls Section */}
        <section className="space-y-4 sm:space-y-6">
          {/* Step Progress Bar Indicator */}
          <SimulationStepProgressBar currentStep={1} />

          {/* 1. Branch Selector (Full Width & Responsive) */}
          <BranchSelector
            branches={nearestBranches}
            onSelectBranch={handleSelectBranch}
            selectedBranch={simulation.branch || null}
            helperText={locationMessage}
          />

          {/* 2. Category Selection (Compact on Mobile 2-col, Tablet 2-col, Desktop 4-col) */}
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">Langkah 2</p>
                <h2 className="mt-0.5 text-lg sm:text-2xl font-black text-primary">Pilih Kategori Barang</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                {filteredCategories.length} kategori
              </span>
            </div>

            {/* Category Search Filter */}
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-inner">
              <div className="flex items-center gap-2">
                <Search size={15} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={e => setCategorySearchQuery(e.target.value)}
                  placeholder="Cari kategori (HP, Laptop, Tablet...)"
                  className="w-full bg-transparent py-1 text-xs sm:text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Category Cards Grid: 2-col on mobile portrait, 3-4 col on mobile landscape/tablet/desktop */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 lg:grid-cols-4">
              {filteredCategories.map((category: PawnCatalogCategory) => {
                const isSelected = simulation.category?.kode === category.kode
                return (
                  <button
                    key={category.kode}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`group rounded-xl border p-2.5 sm:p-4 text-left shadow-sm transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-accent bg-accent/5 ring-2 ring-accent/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex h-14 sm:h-20 items-center justify-center rounded-lg bg-slate-50 p-1 sm:p-2">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={category.name}
                          width={80}
                          height={80}
                          className="h-10 sm:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-primary/5 text-base sm:text-xl font-black text-primary/40">
                          {category.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5 sm:mt-3 text-center text-[11px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-primary truncate">
                      {category.name}
                    </div>
                    <div className={`mx-auto mt-1 sm:mt-2 h-0.5 sm:h-1 transition-all ${isSelected ? 'bg-accent w-6 sm:w-10' : 'bg-slate-200 w-3 sm:w-6'}`} />
                  </button>
                )
              })}
            </div>

            {simulation.category ? (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/5 px-3.5 py-2.5 text-xs sm:text-sm text-primary border border-primary/10">
                <span>Kategori dipilih: <strong className="font-bold">{simulation.category.name}</strong></span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-accent">✓ Terpilih</span>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleContinueFromSetup}
              disabled={!simulation.branch || !simulation.category}
              className="inline-flex w-full sm:flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Lanjut Pilih Merek</span>
              <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setCategorySearchQuery('')
                setBrandSearchQuery('')
                setProductSearchQuery('')
                setVariantSearchQuery('')
                resetEstimateData()
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </section>
      </div>
    )
  }

  // ==========================================
  // STAGE 2: BRAND SELECTION
  // ==========================================
  if (stage === 'brand') {
    return (
      <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-8 shadow-sm ring-1 ring-black/5">
        {/* Header & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">Langkah 3</p>
            <h2 className="mt-0.5 text-xl sm:text-3xl font-black text-primary">Pilih Merek / Brand</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Pilih merek barang yang sesuai.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/simulasi')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Selection Summary Breadcrumb - Hanya Menampilkan Cabang Terpilih */}
        {simulation.branch?.NamaCabang ? (
          <div className="flex flex-wrap text-[11px] sm:text-xs text-slate-600">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 sm:px-3 sm:py-1.5 font-medium">
              Cabang: <strong className="text-primary">{simulation.branch.NamaCabang}</strong>
            </span>
          </div>
        ) : null}

        {/* Step Progress Bar Indicator */}
        <SimulationStepProgressBar currentStep={2} />

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={brandSearchQuery}
            onChange={e => setBrandSearchQuery(e.target.value)}
            placeholder="Cari nama brand (Apple, Samsung, Asus...)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-3 pl-9 pr-4 text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Brand Cards Grid: Mobile portrait 2 col, mobile landscape/tablet/desktop 3 col */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-3 lg:grid-cols-3">
          {filteredBrands.map((brand: PawnCatalogBrand) => {
            const isSelected = simulation.brand?.id === brand.id
            return (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleSelectBrand(brand)}
                className={`flex flex-col justify-between sm:flex-row sm:items-center rounded-xl border-2 p-2.5 sm:p-4 text-left shadow-sm transition group ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-base font-bold text-primary group-hover:text-primary-dark truncate">{brand.name}</span>
                    {isSelected && <span className="rounded-full bg-accent/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-accent shrink-0">✓</span>}
                  </div>
                  <div className="mt-0.5 text-[10px] sm:text-xs text-slate-400">{brand.products.length} produk</div>
                </div>
                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition hidden sm:block" />
              </button>
            )
          })}
        </div>

        {filteredBrands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-400">
            Tidak ada brand yang sesuai dengan pencarian.
          </div>
        ) : null}
      </div>
    )
  }

  // ==========================================
  // STAGE 3: PRODUCT SELECTION
  // ==========================================
  if (stage === 'product') {
    return (
      <div className="space-y-4 sm:space-y-6 rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-8 shadow-sm ring-1 ring-black/5">
        {/* Header & Back Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">Langkah 4</p>
            <h2 className="mt-0.5 text-xl sm:text-3xl font-black text-primary">Pilih Seri Produk</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Pilih tipe atau model produk yang Anda miliki.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/simulasi/brand')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
            <span>Kembali</span>
          </button>
        </div>

        {/* Selection Summary Breadcrumb - Hanya Menampilkan Cabang Terpilih */}
        {simulation.branch?.NamaCabang ? (
          <div className="flex flex-wrap text-[11px] sm:text-xs text-slate-600">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 sm:px-3 sm:py-1.5 font-medium">
              Cabang: <strong className="text-primary">{simulation.branch.NamaCabang}</strong>
            </span>
          </div>
        ) : null}

        {/* Step Progress Bar Indicator */}
        <SimulationStepProgressBar currentStep={3} />

        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={productSearchQuery}
            onChange={e => setProductSearchQuery(e.target.value)}
            placeholder="Cari produk (contoh: iPhone 11, Galaxy S21...)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 sm:py-3 pl-9 pr-4 text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Product Cards Grid: Mobile portrait 2 col, mobile landscape/tablet/desktop 3 col */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-3 lg:grid-cols-3">
          {filteredProducts.map((item: PawnCatalogProduct) => {
            const isSelected = simulation.series?.id === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectProduct(item)}
                className={`flex flex-col justify-between rounded-xl border-2 p-2.5 sm:p-4 text-left shadow-sm transition group ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-primary hover:bg-primary/5'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-base font-bold text-primary group-hover:text-primary-dark truncate">{item.name}</span>
                    {isSelected && <span className="rounded-full bg-accent/10 px-1.5 py-0.2 text-[9px] sm:text-[10px] font-bold text-accent shrink-0">✓</span>}
                  </div>
                  {item.summary && (
                    <div className="mt-0.5 text-[10px] sm:text-xs text-slate-500 line-clamp-2">{item.summary}</div>
                  )}
                </div>
                <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-primary pt-1.5 sm:pt-2 border-t border-slate-100">
                  <span>{isSelected ? 'Terpilih' : 'Pilih'}</span>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-primary transition" />
                </div>
              </button>
            )
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 sm:p-8 text-center text-xs sm:text-sm text-slate-400">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : null}
      </div>
    )
  }

  // ==========================================
  // STAGE 4: VARIANT & ESTIMATION
  // ==========================================
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="space-y-3 sm:space-y-4 rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 sm:pb-4">
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-accent">Langkah Terakhir</p>
            <h2 className="mt-0.5 text-xl sm:text-3xl font-black text-primary">Taksiran &amp; Rincian Gadai</h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">Pilih spesifikasi/variant barang untuk melihat estimasi nilai pencairan.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/simulasi/produk')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft size={15} />
            <span>Ganti Produk</span>
          </button>
        </div>

        {/* Selection Summary Breadcrumb - Hanya Menampilkan Cabang Terpilih */}
        {simulation.branch?.NamaCabang ? (
          <div className="flex flex-wrap text-[11px] sm:text-xs text-slate-600">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium">
              Cabang: <strong className="text-primary">{simulation.branch.NamaCabang}</strong>
            </span>
          </div>
        ) : null}

        {/* Step Progress Bar Indicator */}
        <SimulationStepProgressBar currentStep={4} />
      </div>

      {/* Main Responsive Grid: Mobile/Tablet 1-column stack, Desktop 2-column with sticky side panel */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Variant Selection Cards */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-7">
          {selectedProduct ? (
            <div className="rounded-2xl sm:rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5 space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-primary">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500">Pilih varian atau kapasitas yang sesuai:</p>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-blue-700">
                  {selectedProduct.specs.length} Varian
                </span>
              </div>

              {/* Search Variant */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={variantSearchQuery}
                  onChange={e => setVariantSearchQuery(e.target.value)}
                  placeholder="Cari spesifikasi / kapasitas..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs sm:text-sm focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              {/* Variant Cards: Mobile portrait 2 col, mobile landscape/tablet/desktop 3 col */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-3 xl:grid-cols-3">
                {filteredVariants.map((spec: PawnCatalogSpec) => {
                  const isSpecSelected = simulation.specification === spec.label

                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => handleSelectVariant(spec)}
                      className={`rounded-xl border-2 p-2.5 sm:p-4 text-left transition-all ${
                        isSpecSelected
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-primary/60 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs sm:text-sm text-primary truncate">{spec.label}</div>
                        {isSpecSelected && <span className="text-xs font-bold text-primary shrink-0">✓</span>}
                      </div>
                      {spec.note ? <div className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500 truncate">{spec.note}</div> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column / Side Panel: Summary & Valuation Calculation */}
        <div className="space-y-4 lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5 space-y-3 sm:space-y-4">
            {/* 4-Item Grid Summary: 2 cols on mobile portrait, 4 cols on mobile landscape / tablet, 2 cols on desktop sidebar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-y-2 sm:gap-y-3 gap-x-3 sm:gap-x-4 border-b border-slate-100 pb-3 sm:pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cabang</div>
                <div className="mt-0.5 font-bold text-slate-800 text-xs sm:text-sm truncate">
                  {simulation.branch?.NamaCabang || '-'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kategori</div>
                <div className="mt-0.5 font-bold text-slate-800 text-xs sm:text-sm truncate">
                  {simulation.category?.name || '-'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Barang</div>
                <div className="mt-0.5 font-bold text-slate-800 text-xs sm:text-sm truncate">
                  {simulation.itemName || '-'}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Spesifikasi</div>
                <div className="mt-0.5 font-bold text-slate-800 text-xs sm:text-sm truncate">
                  {simulation.specification || '-'}
                </div>
              </div>
            </div>

            {/* Estimasi Cair Box */}
            <div className="rounded-xl bg-slate-50/90 p-4 sm:p-5 border border-slate-200/80">
              <div className="text-xs text-slate-500 font-medium">Estimasi cair</div>
              <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-primary">
                {estimateLoading || apiLoadState === 'loading' ? (
                  <span className="text-primary font-bold">Memuat harga...</span>
                ) : (
                  selectedRangeText || '-'
                )}
              </div>
            </div>

            {estimateMessage ? <p className="text-xs text-slate-500">{estimateMessage}</p> : null}

            {/* Slider & Loan Details (Shown when price is resolved) */}
            {activePriceRange ? (() => {
              const priceMin = activePriceRange.min ?? 0
              const priceMax = activePriceRange.max ?? 0
              return (
                <div className="space-y-4 pt-1">
                  {/* Nominal Slider Card */}
                  <div className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 to-slate-50 p-4">
                    <div className="flex flex-wrap items-end justify-between gap-2">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Nominal Dipilih</div>
                        <div className="mt-0.5 text-xl sm:text-2xl font-black text-primary">
                          {formatCurrency(selectedLoanAmountResolved || priceMax)}
                        </div>
                      </div>
                      <div className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-primary shadow-sm border border-slate-100">
                        Maks. {formatCurrency(priceMax)}
                      </div>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={getLoanSliderStepCount(priceMin, priceMax)}
                      step={1}
                      value={getSliderStepFromLoanAmount(
                        selectedLoanAmountResolved || priceMax,
                        priceMin,
                        priceMax
                      )}
                      onChange={event =>
                        setSelectedLoanAmount(
                          getLoanAmountFromSliderStep(Number(event.target.value), priceMin, priceMax)
                        )
                      }
                      className="mt-4 w-full cursor-pointer accent-primary"
                    />

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{formatCurrency(priceMin)}</span>
                      <span>{formatCurrency(priceMax)}</span>
                    </div>
                  </div>

                  {/* Tarif Sewa Modal & Biaya Admin (2-Col) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary/5 p-3.5 border border-primary/10">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Sewa Modal (30 Hari)</div>
                      <div className="mt-1 text-base sm:text-lg font-bold text-primary">{formatCurrency(sewaModal)}</div>
                      <div className="mt-1 text-[10px] text-slate-400">10% / 30 hari</div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Biaya Admin</div>
                      <div className="mt-1 text-base sm:text-lg font-bold text-primary">{formatCurrency(adminFee)}</div>
                      <div className="mt-1 text-[10px] text-slate-400">1% dibulatkan</div>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Harga estimasi</span>
                      <span className="font-semibold text-primary">{selectedRangeText}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Pinjaman yang diajukan</span>
                      <span className="font-semibold text-primary">{formatCurrency(selectedLoanAmountResolved || priceMax)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Sewa modal (30 hari)</span>
                      <span className="font-semibold text-primary">{formatCurrency(sewaModal)}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Biaya administrasi</span>
                      <span className="font-semibold text-primary">{formatCurrency(adminFee)}</span>
                    </div>
                    <div className="mt-2 rounded-lg bg-slate-50 p-2.5 font-bold text-primary flex items-center justify-between border border-slate-100">
                      <span>Total Biaya Awal</span>
                      <span className="text-sm text-accent">{formatCurrency(sewaModal + adminFee)}</span>
                    </div>
                    <p className="text-xs font-bold text-red-600 text-left">* S&amp;K Berlaku</p>
                  </div>
                </div>
              )
            })() : null}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleProceedToBooking}
                disabled={!simulation.branch || !simulation.category || !simulation.specification || estimateLoading || !activePriceRange || !selectedLoanAmountResolved}
                className="w-full rounded-xl bg-accent px-5 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-accent/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {estimateLoading ? 'Memuat estimasi...' : 'Ajukan Gadai Sekarang'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/simulasi/produk')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Ganti Seri / Produk Lain
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
