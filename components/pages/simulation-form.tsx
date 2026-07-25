'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Search } from 'lucide-react'
import { getBranches } from '../../lib/services/branch.service'
import {
  calculateAdminFee,
  calculateEstimatedMin,
  calculateSewaModal,
  getBarangEstimates,
  type BarangEstimate,
} from '../../lib/services/simulation.service'
import {
  SIMULATION_CATEGORIES,
  SIMULATION_CATALOG,
  type SimulationCategoryKey,
  type SimulationItemOption,
  type SimulationSpecOption,
} from '../../lib/simulation-catalog'
import type { Branch, ItemCategory, SimulationData } from '../../lib/types'

const ITEMS_PER_PAGE = 9
const LOAN_SLIDER_STEP = 100000

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function mapCategoryKeyToItemCategory(key: SimulationCategoryKey): ItemCategory {
  const category = SIMULATION_CATEGORIES.find((entry: (typeof SIMULATION_CATEGORIES)[number]) => entry.kode === key)

  return {
    kode: key,
    name: category?.name || key,
    icon: category?.icon || '•',
  }
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

export function SimulationForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [simulation, setSimulation] = useState<Partial<SimulationData>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const [estimateMessage, setEstimateMessage] = useState('')
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [apiLoadState, setApiLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [barangEstimates, setBarangEstimates] = useState<BarangEstimate[]>([])
  const [selectedLoanAmount, setSelectedLoanAmount] = useState(0)
  const [selectedTenor, setSelectedTenor] = useState<15 | 30>(15)
  const [branches, setBranches] = useState<Branch[]>([])

  const selectedCategoryKey = (simulation.category?.kode || 'HP') as SimulationCategoryKey
  const categoryItems = SIMULATION_CATALOG[selectedCategoryKey]

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [branches])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategoryKey])

  const updateSimulation = (updater: (prev: Partial<SimulationData>) => Partial<SimulationData>) => {
    setSimulation((prev: Partial<SimulationData>) => updater(prev))
  }

  const nearestBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      const distanceA = a.distance ?? Number.POSITIVE_INFINITY
      const distanceB = b.distance ?? Number.POSITIVE_INFINITY
      return distanceA - distanceB
    })
  }, [branches])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(nearestBranches.length / ITEMS_PER_PAGE))
  }, [nearestBranches])

  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return nearestBranches.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, nearestBranches])

  const paginationStart = nearestBranches.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const paginationEnd = nearestBranches.length === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, nearestBranches.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return categoryItems
    }

    return categoryItems.filter((item: SimulationItemOption) => {
      const searchableText = [item.name, item.summary, ...item.aliases, ...item.specs.map(spec => spec.label)]
        .join(' ')
        .toLowerCase()

      return searchableText.includes(normalizedQuery)
    })
  }, [categoryItems, searchQuery])

  const selectedItem = useMemo(() => {
    return categoryItems.find((item: SimulationItemOption) => item.name === simulation.itemName)
  }, [categoryItems, simulation.itemName])

  const selectedSpec = useMemo(() => {
    if (!selectedItem || !simulation.specification) {
      return undefined
    }

    return selectedItem.specs.find((spec: SimulationSpecOption) => spec.label === simulation.specification)
  }, [selectedItem, simulation.specification])

  const branchCode = simulation.branchCode || simulation.branch?.id || ''
  const selectedNoHp = selectedSpec?.apiCode || selectedSpec?.id || ''

  useEffect(() => {
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

    if (!selectedNoHp) {
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
  }, [selectedNoHp])

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
    if (selectedBranchEstimate && selectedBranchEstimate.maxCash > 0) {
      return {
        min: calculateEstimatedMin(selectedBranchEstimate.maxCash),
        max: selectedBranchEstimate.maxCash,
        source: 'api' as const,
      }
    }

    if (apiLoadState === 'loaded' || apiLoadState === 'error') {
      return fallbackPriceRange
    }

    return null
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
    if (!selectedItem || !activePriceRange || selectedLoanAmountResolved <= 0) {
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
  }, [activePriceRange, adminFee, selectedItem, selectedLoanAmountResolved, selectedNoHp, selectedTenor, sewaModal])

  const selectedRangeText = activePriceRange ? `${formatCurrency(activePriceRange.min)} - ${formatCurrency(activePriceRange.max)}` : null
  const handleSelectBranch = (branch: Branch) => {
    updateSimulation(prev => ({
      ...prev,
      branch,
      branchCode: branch.id,
    }))
    setStep(2)
  }

  const handleSelectCategory = (key: SimulationCategoryKey) => {
    updateSimulation(prev => ({
      ...prev,
      category: mapCategoryKeyToItemCategory(key),
      itemName: undefined,
      specification: undefined,
      valuationMin: undefined,
      valuationMax: undefined,
      valuation: undefined,
      brand: undefined,
      series: undefined,
      variant: undefined,
      storage: undefined,
      year: undefined,
      color: undefined,
    }))

    setSearchQuery('')
    setStep(3)
  }

  const handleSelectItem = (item: SimulationItemOption) => {
    updateSimulation(prev => ({
      ...prev,
      itemName: item.name,
      specification: undefined,
      apiCode: undefined,
      valuationMin: undefined,
      valuationMax: undefined,
      valuation: undefined,
      loanAmount: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    setBarangEstimates([])
    setApiLoadState('idle')
    setEstimateMessage('')
    setSelectedLoanAmount(0)

    setStep(4)
  }

  const handleSelectSpec = (item: SimulationItemOption, spec: SimulationSpecOption) => {
    updateSimulation(prev => ({
      ...prev,
      itemName: item.name,
      specification: spec.label,
      apiCode: spec.apiCode || spec.id,
      valuationMin: undefined,
      valuationMax: undefined,
      valuation: undefined,
      loanAmount: undefined,
      estimatedMin: undefined,
      estimatedMax: undefined,
      sewaModal: undefined,
      adminFee: undefined,
    }))

    setBarangEstimates([])
    setApiLoadState('idle')
    setEstimateMessage('')
    setSelectedLoanAmount(0)
  }

  const handleProceedToBooking = () => {
    if (selectedLoanAmountResolved && simulation.branch && activePriceRange) {
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

      localStorage.setItem('simulationData', JSON.stringify(payload))
      router.push('/booking')
    }
  }

  const stepsLabels = ['Pilih Cabang', 'Pilih Kategori', 'Pilih Barang', 'Ringkasan']

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {stepsLabels.map(label => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`h-2 flex-1 rounded-full transition-all ${
                stepsLabels.indexOf(label) + 1 <= step ? 'bg-accent' : 'bg-gray-200'
              }`}
            />
            {stepsLabels.indexOf(label) < stepsLabels.length - 1 && (
              <div className={`w-0.5 h-2 ${stepsLabels.indexOf(label) + 1 <= step ? 'bg-accent' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold text-primary">Pilih Cabang Terdekat</h2>
              <p className="text-sm text-text-muted mt-1">
                Cabang diambil otomatis dari API dan kode cabang ikut dibawa ke simulasi.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} /> Muat Ulang
            </button>
          </div>

          {locationMessage ? <p className="text-sm text-text-muted">{locationMessage}</p> : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedBranches.map((branch, idx) => (
              <motion.button
                key={branch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleSelectBranch(branch)}
                className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left bg-white"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-semibold text-primary">{branch.NamaCabang}</div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    
                  </span>
                </div>
                <div className="text-sm text-text-muted">{branch.Kota}</div>
                <div className="text-xs text-text-muted mt-2">{branch.Alamat}</div>
                {branch.distance !== undefined && branch.distance !== null && (
                  <div className="mt-3 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {branch.distance.toFixed(1)} km dari lokasi Anda
                  </div>
                )}
              </motion.button>
            ))}
          </div>

          {nearestBranches.length > 0 ? (
            <div className="flex flex-col gap-4 pt-2">
              <p className="text-sm text-text-muted">
                Menampilkan {paginationStart} - {paginationEnd} dari {nearestBranches.length} cabang
              </p>

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                      currentPage === 1
                        ? 'bg-white border border-border opacity-50 cursor-not-allowed'
                        : 'bg-white border border-border hover:border-primary'
                    }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border hover:border-primary'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                      currentPage === totalPages
                        ? 'bg-white border border-border opacity-50 cursor-not-allowed'
                        : 'bg-white border border-border hover:border-primary'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-muted">Tidak ada cabang yang tersedia.</p>
            </div>
          )}
        </motion.div>
      )}

      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Pilih Kategori Barang</h2>
          <p className="text-sm text-text-muted">Untuk tahap awal hanya tersedia HP dan Laptop.</p>

          <div className="grid grid-cols-2 gap-3">
            {SIMULATION_CATEGORIES.map((category: (typeof SIMULATION_CATEGORIES)[number]) => (
              <button
                key={category.kode}
                onClick={() => handleSelectCategory(category.kode)}
                className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="text-sm font-semibold text-primary">{category.name}</div>
                <div className="mt-1 text-xs text-text-muted">{category.description}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-4 py-2 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Kembali
          </button>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">Cari Barang</h2>
            <p className="text-sm text-text-muted">
              Pilih barang dulu, lalu tentukan spesifikasinya. Nama barang yang sama tetap digabung.
            </p>
            {estimateMessage ? <p className="text-sm text-text-muted">{estimateMessage}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-white p-4">
            <div>
              <label className="block text-sm font-semibold text-primary mb-2">Cari barang</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Contoh: iPhone 11, MacBook Air, ThinkPad"
                  className="w-full rounded-lg border border-border py-3 pl-10 pr-4 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
              {/* <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                Cabang {branchCode || '-'}
              </span> */}
              <span className="rounded-full bg-gray-100 px-3 py-1">Kategori {selectedCategoryKey}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item: SimulationItemOption) => {
              const isSelected = simulation.itemName === item.name

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => handleSelectItem(item)}
                  className={`rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-white hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-primary">{item.name}</div>
                      <div className="mt-1 text-sm text-text-muted">{item.summary}</div>
                    </div>
                    <span className="rounded-full bg-accent/10 px-2 py-1 text-[11px] font-semibold text-accent">
                      {item.specs.length} spek
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center text-text-muted">
              Tidak ada barang yang cocok dengan pencarian.
            </div>
          ) : null}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Kembali
            </button>
          </div>
        </motion.div>
      )}

      {step === 4 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <h2 className="text-2xl font-bold text-primary">Pilih Spesifikasi & Ringkasan</h2>

          {selectedItem ? (
            <div className="space-y-4 rounded-2xl border border-border bg-white p-4">
              <div>
                <h3 className="text-lg font-semibold text-primary">{selectedItem.name}</h3>
                <p className="text-sm text-text-muted">
                  Pilih spesifikasi untuk memuat estimasi harga dari API. Jika API gagal, sistem memakai katalog simulasi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedItem.specs.map((spec: SimulationSpecOption) => {
                  const isSpecSelected = simulation.specification === spec.label

                  return (
                    <button
                      key={spec.id}
                      onClick={() => handleSelectSpec(selectedItem, spec)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isSpecSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-primary">{spec.label}</div>
                          {spec.note ? <div className="mt-1 text-sm text-text-muted">{spec.note}</div> : null}
                        </div>
                      </div>
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
                <div className="mt-1 font-semibold text-primary">{simulation.branch?.NamaCabang}</div>
                {/* <div className="text-sm text-text-muted">Kode: {branchCode}</div> */}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-text-muted">Kategori</div>
                <div className="mt-1 font-semibold text-primary">{simulation.category?.name}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-text-muted">Barang</div>
                <div className="mt-1 font-semibold text-primary">{simulation.itemName}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-text-muted">Spesifikasi</div>
                <div className="mt-1 font-semibold text-primary">{simulation.specification || '-'}</div>
              </div>
            </div>

            <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
              <div className="text-sm text-text-muted">Estimasi cair</div>
              <div className="mt-1 text-3xl font-bold text-primary">
                {apiLoadState === 'loading' ? 'Memuat harga...' : selectedRangeText || '-'}
              </div>
              {/* <div className="mt-2 text-sm text-text-muted">
                {apiLoadState === 'loading'
                  ? 'Menunggu data harga dari API barang.'
                  : activePriceRange?.source === 'api'
                    ? 'Harga maksimal diambil dari API barang, lalu nominal pinjaman bisa dipilih sesuai range.'
                    : 'Harga menggunakan katalog simulasi karena API tidak tersedia.'}
              </div> */}
            </div>

            {activePriceRange ? (
              <div className="space-y-3 rounded-xl border border-border p-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-text-muted">Pilih nominal pinjaman</div>
                  {/* <div className="mt-1 text-sm text-text-muted">
                    Geser slider dengan jarak Rp 100.000 untuk memilih nominal di dalam range yang sudah ditentukan.
                  </div> */}
                </div>

                <div className="rounded-xl border border-primary/10 bg-gradient-to-br from-primary/5 to-gray-50 p-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-text-muted">Nominal dipilih</div>
                      <div className="mt-1 text-2xl font-bold text-primary">
                        {formatCurrency(selectedLoanAmountResolved || activePriceRange.max)}
                      </div>
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
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedLoanAmount(activePriceRange.min)}
                      className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-text-muted transition-colors hover:border-primary hover:text-primary"
                    >
                      Pilih minimum
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedLoanAmount(activePriceRange.max)}
                      className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                    >
                      Pilih maksimum
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                    <div className="text-xs uppercase tracking-wide text-text-muted">Tarif sewa modal</div>
                    <div className="mt-1 text-lg font-semibold text-primary">{formatCurrency(sewaModal)}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {[15, 30].map(tenor => (
                        <button
                          key={tenor}
                          type="button"
                          onClick={() => setSelectedTenor(tenor as 15 | 30)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                            selectedTenor === tenor ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted'
                          }`}
                        >
                          {tenor} hari
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-text-muted">
                      {selectedTenor === 15
                        ? '15 hari dikenakan 5% dari nominal pinjaman, dibulatkan ke atas per Rp 500.'
                        : '30 hari dikenakan 10% dari nominal pinjaman, dibulatkan ke atas per Rp 500.'}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border p-4">
                    <div className="text-xs uppercase tracking-wide text-text-muted">Biaya admin</div>
                    <div className="mt-1 text-lg font-semibold text-primary">{formatCurrency(adminFee)}</div>
                    <div className="mt-2 text-sm text-text-muted">
                      Dihitung 1% dari nominal pinjaman dan dibulatkan ke atas per Rp 500.
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-4">
                  <div className="text-xs uppercase tracking-wide text-text-muted">Rincian estimasi</div>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text-muted">Harga estimasi</span>
                      <span className="font-semibold text-primary">{selectedRangeText || '-'}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text-muted">Hasil estimasi yang dipilih</span>
                      <span className="font-semibold text-primary">{formatCurrency(selectedLoanAmountResolved)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text-muted">Sewa modal</span>
                      <span className="font-semibold text-primary">{formatCurrency(sewaModal)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text-muted">Admin</span>
                      <span className="font-semibold text-primary">{formatCurrency(adminFee)}</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-lg bg-primary/5 p-3 text-sm text-text-muted">
                    Total biaya awal estimasi: <span className="font-semibold text-primary">{formatCurrency(sewaModal + adminFee)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-4 text-sm text-text-muted">
                {apiLoadState === 'loading'
                  ? 'Sedang memuat harga dari API barang...'
                  : 'Pilih spesifikasi untuk melihat harga dan nominal pinjaman.'}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              className="flex-1 px-4 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} /> Ubah Barang
            </button>
            <button
              onClick={handleProceedToBooking}
              disabled={!simulation.specification || estimateLoading || !activePriceRange || !selectedLoanAmountResolved}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {estimateLoading ? 'Memuat estimasi...' : 'Lanjut Booking'} <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
