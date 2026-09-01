'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react'
import { BranchSelector } from './branch-selector'
import { getBranches } from '../../lib/services/branch.service'
import {
  calculateAdminFee,
  calculateEstimatedMin,
  calculateSewaModal,
  getBarangEstimates,
  type BarangEstimate,
} from '../../lib/services/simulation.service'
import { getPawnCatalog, type PawnCatalogBrand, type PawnCatalogCategory, type PawnCatalogProduct, type PawnCatalogSpec } from '../../lib/services/pawn-catalog.service'
import type { Branch, ItemBrand, ItemCategory, ItemSeries, SimulationData } from '../../lib/types'

type SimulationStage = 'setup' | 'brand' | 'product' | 'variant'

type SimulationFormProps = {
  stage: SimulationStage
}

const LOAN_SLIDER_STEP = 100000
const STORAGE_KEY = 'simulationData'

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function clampLoanAmount(amount: number, minimum: number, maximum: number): number {
  if (amount < minimum) {
    return minimum
  }

  if (amount > maximum) {
    return maximum
  }

  return amount
}

function getLoanSliderStepCount(minimum: number, maximum: number): number {
  return Math.max(Math.ceil((maximum - minimum) / LOAN_SLIDER_STEP), 1)
}

function getLoanAmountFromSliderStep(sliderStep: number, minimum: number, maximum: number): number {
  const sliderStepCount = getLoanSliderStepCount(minimum, maximum)

  if (sliderStep >= sliderStepCount) {
    return maximum
  }

  return clampLoanAmount(minimum + sliderStep * LOAN_SLIDER_STEP, minimum, maximum)
}

function getSliderStepFromLoanAmount(amount: number, minimum: number, maximum: number): number {
  const sliderStepCount = getLoanSliderStepCount(minimum, maximum)

  if (amount >= maximum) {
    return sliderStepCount
  }

  return Math.round((clampLoanAmount(amount, minimum, maximum) - minimum) / LOAN_SLIDER_STEP)
}

function readStoredSimulation(): Partial<SimulationData> {
  if (typeof window === 'undefined') {
    return {}
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY)
  if (!storedValue) {
    return {}
  }

  try {
    return JSON.parse(storedValue) as Partial<SimulationData>
  } catch {
    return {}
  }
}

function clearStoredSimulation(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(STORAGE_KEY)
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
  const [branchSearchQuery, setBranchSearchQuery] = useState('')
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const [brandSearchQuery, setBrandSearchQuery] = useState('')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [variantSearchQuery, setVariantSearchQuery] = useState('')

  useEffect(() => {
    if (stage === 'setup') {
      clearStoredSimulation()
      setSimulation({})
      setHydrated(true)
      return
    }

    setSimulation(readStoredSimulation())
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
  }, [hydrated, simulation])

  const selectedCategoryKey = simulation.category?.kode || ''
  const selectedCategory = useMemo(() => catalog.find(entry => entry.kode === selectedCategoryKey), [catalog, selectedCategoryKey])
  const categoryItems = selectedCategory?.brands || []

  const selectedProduct = useMemo(() => {
    if (!simulation.series?.id) {
      return undefined
    }

    for (const brand of categoryItems) {
      const product = brand.products.find(item => item.id === simulation.series?.id)
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

    if (stage === 'product' && (!hasBranch || !hasCategory || !hasBrand || !selectedCategory?.brands.find(brand => brand.id === simulation.brand?.id))) {
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

  const filteredBranches = useMemo(() => {
    const query = branchSearchQuery.trim().toLowerCase()

    if (!query) {
      return nearestBranches
    }

    return nearestBranches.filter(branch =>
      [branch.NamaCabang, branch.Kota, branch.Provinsi, branch.Alamat].join(' ').toLowerCase().includes(query)
    )
  }, [branchSearchQuery, nearestBranches])

  const filteredCategories = useMemo(() => {
    const query = categorySearchQuery.trim().toLowerCase()

    if (!query) {
      return catalog
    }

    return catalog.filter(category =>
      [category.name, category.kode, category.brands.map(brand => brand.name).join(' ')].join(' ').toLowerCase().includes(query)
    )
  }, [catalog, categorySearchQuery])

  const brandOptions = useMemo(() => categoryItems, [categoryItems])

  const filteredBrands = useMemo(() => {
    const query = brandSearchQuery.trim().toLowerCase()

    if (!query) {
      return brandOptions
    }

    return brandOptions.filter(option => option.name.toLowerCase().includes(query))
  }, [brandOptions, brandSearchQuery])

  const selectedBrandProducts = useMemo(() => {
    if (!simulation.brand?.id) {
      return []
    }

    return brandOptions.find(option => option.id === simulation.brand?.id)?.products || []
  }, [brandOptions, simulation.brand?.id])

  const filteredProducts = useMemo(() => {
    const query = productSearchQuery.trim().toLowerCase()

    if (!query) {
      return selectedBrandProducts
    }

    return selectedBrandProducts.filter(item =>
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

      return selectedProduct.specs.filter(spec =>
      [spec.label, spec.note || '', spec.id].join(' ').toLowerCase().includes(query)
    )
  }, [selectedProduct, variantSearchQuery])

  useEffect(() => {
    if (stage !== 'variant') {
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
        setEstimateMessage('Mengambil estimasi harga dari API barang...')
        const estimates = await getBarangEstimates(noHP)

        if (!isMounted) {
          return
        }

        setBarangEstimates(estimates)
        setApiLoadState('loaded')

        if (estimates.length === 0) {
          setEstimateMessage('Data estimasi barang belum tersedia untuk kode ini. Menggunakan referensi katalog sementara.')
        } else {
          setEstimateMessage('Harga yang ditampilkan adalah estimasi dan akan difilter berdasarkan cabang yang dipilih.')
        }
      } catch {
        if (isMounted) {
          setBarangEstimates([])
          setApiLoadState('error')
          setEstimateMessage('Gagal mengambil estimasi dari API barang. Menggunakan referensi katalog sementara.')
        }
      } finally {
        if (isMounted) {
          setEstimateLoading(false)
        }
      }
    }

    if (!selectedNoHp || !branchCode) {
      setBarangEstimates([])
      setApiLoadState('idle')
      setEstimateMessage('')
      setEstimateLoading(false)
      return () => {
        isMounted = false
      }
    }

    void loadBarangEstimates(selectedNoHp)

    return () => {
      isMounted = false
    }
  }, [branchCode, selectedNoHp, stage])

  const selectedBranchEstimate = useMemo(() => {
    if (!branchCode) {
      return undefined
    }

    return barangEstimates.find(entry => entry.kodeCabang === branchCode)
  }, [barangEstimates, branchCode])

  const fallbackPriceRange = useMemo(() => {
    if (!selectedSpec) {
      return null
    }

    const maxCash = selectedSpec.maxValuation
    return {
      min: calculateEstimatedMin(maxCash),
      max: maxCash,
      source: 'catalog' as const,
    }
  }, [selectedSpec])

  const activePriceRange = useMemo(() => {
    if (apiLoadState === 'loading' || apiLoadState === 'idle') {
      return null
    }

    if (selectedBranchEstimate && selectedBranchEstimate.maxCash > 0) {
      return {
        min: calculateEstimatedMin(selectedBranchEstimate.maxCash),
        max: selectedBranchEstimate.maxCash,
        source: 'api' as const,
      }
    }

    return fallbackPriceRange
  }, [apiLoadState, fallbackPriceRange, selectedBranchEstimate])

  const selectedLoanAmountResolved = selectedLoanAmount || activePriceRange?.max || 0
  const sewaModal = calculateSewaModal(selectedLoanAmountResolved, selectedTenor)
  const adminFee = calculateAdminFee(selectedLoanAmountResolved)

  useEffect(() => {
    if (!activePriceRange) {
      return
    }

    setSelectedLoanAmount(prev => {
      if (prev >= activePriceRange.min && prev <= activePriceRange.max) {
        return prev
      }

      return activePriceRange.max
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
    const series: ItemSeries = {
      id: item.id,
      brandId: simulation.brand?.id || '',
      name: item.name,
    }

    updateSimulation(prev => ({
      ...prev,
      series,
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
      router.push('/booking')
    }
  }

  const selectedRangeText = activePriceRange ? `${formatCurrency(activePriceRange.min)} - ${formatCurrency(activePriceRange.max)}` : null

  if (!hydrated) {
    return <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-black/5">Memuat simulasi...</div>
  }

  if (stage === 'setup') {
    return (
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] bg-white px-6 py-8 shadow-sm ring-1 ring-black/5 sm:px-8 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(227,30,36,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,30,61,0.08),transparent_25%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-5">
              <div className="inline-flex rounded-full bg-accent/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-accent">
                Taksir Barang Online
              </div>
              <div className="space-y-2">
                <h1 className="max-w-xl text-4xl font-black leading-[0.95] text-primary sm:text-5xl lg:text-6xl">
                  <span className="block">Taksir Barang</span>
                  <span className="relative block text-accent">
                    Online
                    <span className="absolute -right-4 top-3 h-1.5 w-10 rotate-[-12deg] rounded-full bg-accent/80 sm:-right-6 sm:top-4 sm:w-12" />
                  </span>
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Ingin tahu berapa nilai barang yang bisa kamu gadaikan? Sekarang, kamu bisa mendapatkan estimasi harga barang sebelum datang ke cabang! Gunakan fitur Taksir Barang Online kami untuk mengetahui perkiraan nilai gadai.
                </p>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -left-5 top-8 h-24 w-24 rounded-full bg-slate-900/10 blur-xl" />
              <div className="absolute -right-4 bottom-8 h-28 w-28 rounded-full bg-accent/15 blur-2xl" />
              <div className="relative rounded-[2rem] border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 p-4 shadow-2xl shadow-slate-900/20">
                <div className="mx-auto w-[230px] rounded-[2rem] border-8 border-slate-950 bg-white p-3 shadow-lg sm:w-[260px]">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <div className="mx-auto mb-4 h-1.5 w-24 rounded-full bg-slate-200" />
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Gadai Sakti</p>
                      <div className="mt-3 rounded-2xl bg-slate-900 px-4 py-3 text-right text-white">
                        <div className="text-[11px] uppercase tracking-[0.2em] text-white/60">Estimasi</div>
                        <div className="mt-2 text-2xl font-black">Rp 9.500.000</div>
                      </div>
                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        Rp
                      </div>
                      <button className="mt-4 w-full rounded-full bg-accent px-4 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30">
                        Estimasi Sekarang
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-3 top-8 h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-sm" />
                <div className="absolute -right-1 top-24 h-16 w-16 rounded-full bg-white/10 backdrop-blur-sm" />
                <div className="absolute left-4 top-4 h-24 w-24 rounded-full border border-white/10 bg-white/5" />
                <div className="absolute right-5 bottom-5 h-10 w-10 rounded-full border border-white/15 bg-white/10" />
                <div className="absolute -left-8 bottom-6 h-16 w-16 rounded-full bg-amber-300/90 shadow-lg shadow-amber-500/20" />
                <div className="absolute -right-4 bottom-12 h-12 w-12 rounded-full bg-amber-200/80 shadow-lg shadow-amber-500/20" />
                <div className="absolute left-0 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <BranchSelector branches={nearestBranches} onSelectBranch={handleSelectBranch} selectedBranch={simulation.branch || null} helperText={locationMessage} />

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pilih Kategori Barang</p>
              <h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Pilih Kategori Barang</h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              {filteredCategories.map(category => {
                const isSelected = simulation.category?.kode === category.kode
                return (
                  <button
                    key={category.kode}
                    type="button"
                    onClick={() => handleSelectCategory(category)}
                    className={`group rounded-xl border border-slate-100 bg-white p-3 text-left shadow-sm transition-all hover:scale-105 hover:shadow-md ${
                      isSelected ? 'border-accent ring-1 ring-accent/20' : ''
                    }`}
                  >
                    <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 p-2">
                      {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} width={92} height={92} className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-2xl font-black text-primary/40 transition-transform duration-300 group-hover:scale-105">
                          {category.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center text-xs font-black uppercase tracking-[0.18em] text-primary">{category.name}</div>
                    <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-accent" />
                  </button>
                )
              })}
            </div>

            <div className="mt-5 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={e => setCategorySearchQuery(e.target.value)}
                  placeholder="Ketik nama merk hp/laptop/kamera dsb."
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white shadow-md shadow-accent/30"
                  aria-label="Cari kategori"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>

            {simulation.category ? (
              <div className="mt-4 rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
                Kategori dipilih: <span className="font-semibold">{simulation.category.name}</span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleContinueFromSetup}
              disabled={!simulation.branch || !simulation.category}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Lanjut ke Brand <ChevronRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setCategorySearchQuery('')
                setBranchSearchQuery('')
                setBrandSearchQuery('')
                setProductSearchQuery('')
                setVariantSearchQuery('')
                resetEstimateData()
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-primary shadow-sm transition-colors hover:border-accent"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (stage === 'brand') {
    return (
      <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pilih Brand</p>
            <h2 className="mt-2 text-3xl font-black text-primary">Halaman Brand</h2>
            <p className="mt-2 text-sm text-slate-600">Halaman ini khusus untuk brand setelah cabang dan kategori sudah dipilih.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/simulasi')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={brandSearchQuery}
            onChange={e => setBrandSearchQuery(e.target.value)}
            placeholder="Cari brand"
            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {filteredBrands.map(brand => (
            <button
              key={brand.id}
              type="button"
              onClick={() => handleSelectBrand(brand)}
              className="rounded-2xl border-2 border-border bg-white p-4 text-left shadow-sm transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="text-sm font-semibold text-primary">{brand.name}</div>
              <div className="mt-1 text-xs text-text-muted">{brand.products.length} produk</div>
            </button>
          ))}
        </div>

        {filteredBrands.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center text-text-muted">
            Tidak ada brand yang cocok dengan pencarian.
          </div>
        ) : null}
      </div>
    )
  }

  if (stage === 'product') {
    return (
      <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pilih Produk</p>
            <h2 className="mt-2 text-3xl font-black text-primary">Halaman Produk</h2>
            <p className="mt-2 text-sm text-slate-600">Setelah brand dipilih, lanjut ke halaman produk ini sebelum variant.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/simulasi/brand')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm"
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={productSearchQuery}
            onChange={e => setProductSearchQuery(e.target.value)}
            placeholder="Cari produk"
            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredProducts.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectProduct(item)}
              className="rounded-2xl border-2 border-border bg-white p-4 text-left shadow-sm transition-all hover:border-primary hover:bg-primary/5"
            >
              <div className="text-lg font-semibold text-primary">{item.name}</div>
              <div className="mt-1 text-sm text-text-muted">{item.summary}</div>
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center text-text-muted">
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-6 rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pilih Variant</p>
          <h2 className="mt-2 text-3xl font-black text-primary">Halaman Variant</h2>
          <p className="mt-2 text-sm text-slate-600">Variant dipilih di halaman ini, lalu estimasi taksiran ditampilkan di bawah.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/simulasi/produk')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm"
        >
          <ChevronLeft size={16} /> Kembali
        </button>
      </div>

      {selectedProduct ? (
        <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">{selectedProduct.name}</h3>
            <p className="text-sm text-text-muted">Pilih variant untuk memuat estimasi harga dari API.</p>
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={variantSearchQuery}
              onChange={e => setVariantSearchQuery(e.target.value)}
              placeholder="Cari variant"
              className="w-full rounded-lg border border-border py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredVariants.map(spec => {
              const isSpecSelected = simulation.specification === spec.label

              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSelectVariant(spec)}
                  className={`rounded-xl border-2 p-4 text-left transition-all ${
                    isSpecSelected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="font-semibold text-primary">{spec.label}</div>
                  {spec.note ? <div className="mt-1 text-sm text-text-muted">{spec.note}</div> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-white p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Cabang</div>
            <div className="mt-1 font-semibold text-primary">{simulation.branch?.NamaCabang || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Kategori</div>
            <div className="mt-1 font-semibold text-primary">{simulation.category?.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Brand</div>
            <div className="mt-1 font-semibold text-primary">{simulation.brand?.name || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Produk</div>
            <div className="mt-1 font-semibold text-primary">{simulation.itemName || '-'}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-text-muted">Variant</div>
            <div className="mt-1 font-semibold text-primary">{simulation.specification || '-'}</div>
          </div>
        </div>

        <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
          <div className="text-sm text-text-muted">Estimasi cair</div>
          <div className="mt-1 text-3xl font-bold text-primary">
            {selectedRangeText || (apiLoadState === 'loading' ? 'Memuat harga...' : '-')}
          </div>
        </div>

        {estimateMessage ? <p className="text-sm text-text-muted">{estimateMessage}</p> : null}

        {activePriceRange ? (
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-gray-50 p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-text-muted">Nominal dipilih</div>
                  <div className="mt-1 text-2xl font-bold text-primary">{formatCurrency(selectedLoanAmountResolved || activePriceRange.max)}</div>
                </div>
                <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  Maks. {formatCurrency(activePriceRange.max)}
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={getLoanSliderStepCount(activePriceRange.min, activePriceRange.max)}
                step={1}
                value={getSliderStepFromLoanAmount(
                  selectedLoanAmountResolved || activePriceRange.max,
                  activePriceRange.min,
                  activePriceRange.max
                )}
                onChange={event =>
                  setSelectedLoanAmount(
                    getLoanAmountFromSliderStep(Number(event.target.value), activePriceRange.min, activePriceRange.max)
                  )
                }
                className="mt-5 w-full cursor-pointer accent-primary"
              />

              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-text-muted">
                <span>{formatCurrency(activePriceRange.min)}</span>
                <span>{formatCurrency(activePriceRange.max)}</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                <div className="text-xs uppercase tracking-wide text-text-muted">Tarif sewa modal</div>
                <div className="mt-1 text-lg font-semibold text-primary">{formatCurrency(sewaModal)}</div>
                <div className="mt-2 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">30 hari</div>
                <div className="mt-2 text-sm text-text-muted">30 hari dihitung 10% dari nominal pinjaman dan dibulatkan ke atas per Rp 500.</div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="text-xs uppercase tracking-wide text-text-muted">Biaya admin</div>
                <div className="mt-1 text-lg font-semibold text-primary">{formatCurrency(adminFee)}</div>
                <div className="mt-2 text-sm text-text-muted">Dihitung 1% dari nominal pinjaman dan dibulatkan ke atas per Rp 500.</div>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4">
              <div className="text-xs uppercase tracking-wide text-text-muted">Rincian Estimasi</div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-muted">Harga estimasi</span>
                  <span className="text-right font-semibold text-primary">{selectedRangeText}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-muted">Hasil estimasi yang dipilih</span>
                  <span className="text-right font-semibold text-primary">{formatCurrency(selectedLoanAmountResolved || activePriceRange.max)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-muted">Sewa modal</span>
                  <span className="text-right font-semibold text-primary">{formatCurrency(sewaModal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-text-muted">Admin</span>
                  <span className="text-right font-semibold text-primary">{formatCurrency(adminFee)}</span>
                </div>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-primary">
                Total biaya awal estimasi: {formatCurrency(sewaModal + adminFee)}
              </div>
              <p className="mt-2 text-xs font-semibold text-red-600">*S&amp;K Berlaku</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/simulasi/produk')}
          className="flex-1 rounded-xl border border-border px-4 py-3 font-semibold text-primary"
        >
          Ubah Produk
        </button>
        <button
          type="button"
          onClick={handleProceedToBooking}
          disabled={!simulation.branch || !simulation.category || !simulation.specification || estimateLoading || !activePriceRange || !selectedLoanAmountResolved}
          className="flex-1 rounded-xl bg-primary px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {estimateLoading ? 'Memuat estimasi...' : 'Estimasi Sekarang'}
        </button>
      </div>
    </div>
  )
}
