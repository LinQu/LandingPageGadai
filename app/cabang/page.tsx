'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Clock3,
  LocateFixed,
  MapPinned,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Search,
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBranches } from '@/lib/services/branch.service'
import type { Branch } from '@/lib/types'

const ITEMS_PER_PAGE = 6

type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  const windowSize = 5

  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const halfWindow = Math.floor(windowSize / 2)
  let startPage = Math.max(1, currentPage - halfWindow)
  let endPage = startPage + windowSize - 1

  // Saat masih di awal, pertahankan 1-5.
  if (currentPage <= halfWindow + 1) {
    startPage = 1
    endPage = windowSize
  }

  // Jika window sudah menyentuh halaman sebelum terakhir, geser ke ujung
  // supaya jumlah tombol tetap ringkas dan halaman terakhir ikut terlihat.
  if (endPage >= totalPages - 1) {
    endPage = totalPages
    startPage = Math.max(1, totalPages - windowSize + 1)
  }

  const items: PaginationItem[] = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index,
  )

  // Selama halaman terakhir belum masuk window, tampilkan shortcut ke halaman terakhir.
  if (endPage < totalPages) {
    items.push('ellipsis-end', totalPages)
  }

  return items
}

type UserLocation = {
  latitude: number
  longitude: number
}

function formatWhatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits
  return digits
}

function getWhatsappUrl(branch: Branch): string {
  const message = `(WEB)\nHallo, saya tertarik dan ingin bertanya mengenai layanan gadai di ${branch.NamaCabang}.\n\n#${branch.id}`
  return `https://wa.me/${formatWhatsappPhone(branch.Phone)}?text=${encodeURIComponent(message)}`
}

function getGoogleMapsUrl(branch: Branch, userLocation: UserLocation | null): string {
  const params = new URLSearchParams({
    api: '1',
    destination: `${branch.latitude},${branch.longitude}`,
    travelmode: 'driving',
    dir_action: 'navigate',
  })

  if (userLocation) {
    params.set('origin', `${userLocation.latitude},${userLocation.longitude}`)
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`
}

function normalizeLabel(value: string) {
  return value.replace(/([A-Z])([A-Z]{2,})/g, '$1 $2').replace(/\s+/g, ' ').trim()
}

function BranchVisual({ branch }: { branch: Branch }) {
  return (
    <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-br from-[#bfe1f2] via-[#eaf6fb] to-[#9ac7df]">
      <div className="absolute inset-x-0 bottom-0 h-12 bg-[#d9d3bd]/80" />
      <div className="absolute left-1/2 top-7 w-[78%] -translate-x-1/2 rounded-t-md border border-white/70 bg-white shadow-lg">
        <div className="flex h-9 items-center justify-center bg-primary px-3 text-sm font-black tracking-[0.12em] text-white">
          GADAI <span className="ml-1 text-accent">SAKTI</span>
        </div>
        <div className="h-2 bg-[#ffd21f]" />
        <div className="h-2 bg-accent" />
        <div className="grid grid-cols-3 gap-2 px-4 py-3">
          <span className="h-8 rounded-sm border border-slate-300 bg-[#cfe4ef]" />
          <span className="h-8 rounded-sm border border-slate-300 bg-[#cfe4ef]" />
          <span className="h-8 rounded-sm border border-slate-300 bg-[#cfe4ef]" />
        </div>
      </div>
      <div className="absolute bottom-3 left-3 max-w-[78%] rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary shadow-sm">
        {branch.NamaCabang}
      </div>
    </div>
  )
}

export default function CabangPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedBranch, setSelectedBranch] = useState('')
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const loadBranches = async (location: UserLocation | null) => {
    try {
      const data = await getBranches(location?.latitude ?? 0, location?.longitude ?? 0)
      setBranches(data)
      setErrorMessage('')
    } catch {
      setErrorMessage('Gagal mengambil data cabang. Silakan coba muat ulang halaman.')
    } finally {
      setLoading(false)
      setLocating(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const loadWithoutLocation = () => {
      if (!mounted) return
      setLocationMessage('Aktifkan lokasi agar jarak cabang terdekat dapat ditampilkan.')
      void loadBranches(null)
    }

    if (!navigator.geolocation) {
      loadWithoutLocation()
      return () => {
        mounted = false
      }
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        if (!mounted) return
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setUserLocation(location)
        setLocationMessage('Lokasi Anda aktif. Cabang diurutkan dari yang paling dekat.')
        void loadBranches(location)
      },
      () => loadWithoutLocation(),
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 }
    )

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeSearch, selectedProvince, selectedCity, selectedBranch])

  useEffect(() => {
    if (selectedProvince && selectedCity) {
      const cityStillAvailable = branches.some(
        branch => branch.Provinsi === selectedProvince && branch.Kota === selectedCity
      )
      if (!cityStillAvailable) setSelectedCity('')
    }
  }, [branches, selectedCity, selectedProvince])

  const provinces = useMemo(
    () => [...new Set(branches.map(branch => branch.Provinsi).filter(Boolean))].sort(),
    [branches]
  )

  const cities = useMemo(() => {
    const source = selectedProvince
      ? branches.filter(branch => branch.Provinsi === selectedProvince)
      : branches
    return [...new Set(source.map(branch => branch.Kota).filter(Boolean))].sort()
  }, [branches, selectedProvince])

  const branchNames = useMemo(
    () => [...new Set(branches.map(branch => branch.NamaCabang).filter(Boolean))].sort(),
    [branches]
  )

  const filteredBranches = useMemo(() => {
    const query = activeSearch.trim().toLowerCase()

    return branches.filter(branch => {
      if (selectedProvince && branch.Provinsi !== selectedProvince) return false
      if (selectedCity && branch.Kota !== selectedCity) return false
      if (selectedBranch && branch.NamaCabang !== selectedBranch) return false

      if (!query) return true
      return [branch.NamaCabang, branch.Kota, branch.Provinsi, branch.Alamat]
        .filter(Boolean)
        .some(value => value.toLowerCase().includes(query))
    })
  }, [activeSearch, branches, selectedBranch, selectedCity, selectedProvince])

  const sortedBranches = useMemo(() => {
    const copy = [...filteredBranches]
    if (userLocation) {
      return copy.sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) -
          (b.distance ?? Number.POSITIVE_INFINITY)
      )
    }
    return copy.sort((a, b) => a.NamaCabang.localeCompare(b.NamaCabang))
  }, [filteredBranches, userLocation])

  const totalPages = Math.max(1, Math.ceil(sortedBranches.length / ITEMS_PER_PAGE))
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  )
  const paginatedBranches = sortedBranches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setActiveSearch(searchInput.trim())
  }

  const resetFilters = () => {
    setSearchInput('')
    setActiveSearch('')
    setSelectedProvince('')
    setSelectedCity('')
    setSelectedBranch('')
    setCurrentPage(1)
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Browser Anda tidak mendukung akses lokasi.')
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      position => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        setUserLocation(location)
        setLocationMessage('Lokasi Anda aktif. Jarak ke cabang sudah ditampilkan.')
        void loadBranches(location)
      },
      () => {
        setLocating(false)
        setLocationMessage('Lokasi belum dapat diakses. Periksa izin lokasi pada browser.')
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 300000 }
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-200 bg-[#f4f6fb]">
          <div className="site-container grid items-center gap-8 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-16">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                Lokasi Cabang
              </p>
              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] text-primary sm:text-5xl">
                Lokasi Cabang<br />Gadai Sakti Indonesia
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Temukan cabang Gadai Sakti terdekat dari lokasi Anda. Kami hadir lebih dekat untuk memberikan layanan gadai yang instan, terjamin, dan terpercaya.
              </p>

              <form onSubmit={handleSearch} className="mt-7 flex max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <Search className="ml-4 mt-3.5 shrink-0 text-slate-400" size={18} />
                <input
                  value={searchInput}
                  onChange={event => setSearchInput(event.target.value)}
                  placeholder="Masukkan provinsi, kota, kecamatan, atau nama cabang"
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="m-1.5 rounded-md bg-accent px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-95"
                >
                  Cari Lokasi
                </button>
              </form>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={requestLocation}
                  disabled={locating}
                  className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline disabled:opacity-60"
                >
                  <LocateFixed size={14} />
                  {locating ? 'Mendeteksi lokasi...' : 'Gunakan lokasi saya'}
                </button>
                {locationMessage ? <span className="text-slate-500">• {locationMessage}</span> : null}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mx-auto h-[245px] w-full max-w-[460px]"
            >
              <div className="absolute inset-x-3 bottom-5 h-28 -skew-y-6 rounded-[32px] bg-white shadow-[0_20px_45px_rgba(19,55,77,0.12)]" />
              <div className="absolute left-1/2 top-11 w-[62%] -translate-x-1/2 overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-xl">
                <div className="bg-primary px-5 py-3 text-center text-lg font-black tracking-wider text-white">
                  GADAI <span className="text-accent">SAKTI</span>
                </div>
                <div className="h-2 bg-[#ffd21f]" />
                <div className="h-2 bg-accent" />
                <div className="grid grid-cols-3 gap-3 px-5 py-5">
                  {[0, 1, 2].map(item => (
                    <span key={item} className="h-14 rounded border-2 border-primary/30 bg-[#d9edf6]" />
                  ))}
                </div>
              </div>
              <div className="absolute right-5 top-1 flex h-24 w-24 items-center justify-center rounded-full bg-accent/10">
                <MapPin className="fill-accent text-accent drop-shadow-sm" size={78} strokeWidth={1.8} />
              </div>
              <div className="absolute bottom-1 left-5 right-5 h-14 rounded-[50%] border-b-4 border-slate-300/60" />
            </motion.div>
          </div>
        </section>

        <section className="site-container py-8">
          <div className="mb-7">
            <p className="mb-2 text-xs font-semibold text-slate-500">Pilih Wilayah Pencarian</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className={`rounded-full border px-4 py-2 text-xs font-bold transition ${
                  !selectedProvince && !selectedCity && !selectedBranch && !activeSearch
                    ? 'border-primary bg-primary text-white'
                    : 'border-primary/25 bg-white text-primary hover:border-primary'
                }`}
              >
                Semua
              </button>

              <FilterSelect
                label="Provinsi"
                value={selectedProvince}
                options={provinces}
                onChange={value => {
                  setSelectedProvince(value)
                  setSelectedCity('')
                }}
              />
              <FilterSelect
                label="Kota"
                value={selectedCity}
                options={cities}
                onChange={setSelectedCity}
              />
              <div
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400"
                title="Data API saat ini belum menyediakan field kecamatan/kelurahan terpisah"
              >
                Kelurahan <ChevronDown size={13} />
              </div>
              <FilterSelect
                label="Cabang"
                value={selectedBranch}
                options={branchNames}
                onChange={setSelectedBranch}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-slate-500">Memuat data cabang...</div>
          ) : errorMessage ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-8 text-center text-sm text-red-700">
              {errorMessage}
            </div>
          ) : sortedBranches.length > 0 ? (
            <>
              <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {paginatedBranches.map((branch, index) => (
                  <motion.article
                    key={branch.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_6px_18px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)]"
                  >
                    <BranchVisual branch={branch} />

                    <div className="px-1 pb-1 pt-4">
                      <h2 className="text-xl font-extrabold leading-tight text-primary">
                        {branch.NamaCabang}
                      </h2>

                      <div className="mt-3 space-y-2.5 text-xs leading-5 text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 shrink-0 text-accent" size={15} />
                          <span className="font-semibold text-primary">
                            {normalizeLabel(branch.Kota || branch.Provinsi)}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Navigation className="mt-0.5 shrink-0 text-slate-500" size={15} />
                          <span>{branch.Alamat}</span>
                        </div>
                        {branch.Phone ? (
                          <div className="flex items-start gap-2">
                            <Phone className="mt-0.5 shrink-0 text-slate-500" size={15} />
                            <span>{branch.Phone}</span>
                          </div>
                        ) : null}
                        <div className="flex items-start gap-2">
                          <Clock3 className="mt-0.5 shrink-0 text-slate-500" size={15} />
                          <span>{branch.hours || 'Jam operasional: konfirmasi ke cabang'}</span>
                        </div>
                      </div>

                      {branch.distance !== undefined ? (
                        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eef7fb] px-3 py-1.5 text-[11px] font-bold text-primary">
                          <LocateFixed size={13} />
                          ± {branch.distance.toFixed(1)} km dari lokasi Anda
                        </div>
                      ) : null}

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <a
                          href={getGoogleMapsUrl(branch, userLocation)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-primary px-3 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/5"
                        >
                          <MapPinned size={15} />
                          Detail Lokasi
                        </a>
                        {branch.Phone ? (
                          <a
                            href={getWhatsappUrl(branch)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2.5 text-xs font-bold text-white transition hover:brightness-95"
                          >
                            <MessageCircle size={15} />
                            Chat Admin
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-400">
                            Nomor belum tersedia
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Prev
                  </button>
                  {paginationItems.map(item => {
                    if (typeof item !== 'number') {
                      return (
                        <span
                          key={item}
                          className="flex h-9 min-w-6 items-center justify-center px-1 text-xs font-bold text-slate-400"
                          aria-hidden="true"
                        >
                          ...
                        </span>
                      )
                    }

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        aria-current={currentPage === item ? 'page' : undefined}
                        className={`h-9 min-w-9 rounded-full px-3 text-xs font-bold transition ${
                          currentPage === item
                            ? 'bg-primary text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-primary hover:border-primary/40 hover:bg-primary/5'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-primary disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 py-16 text-center">
              <Building2 className="mx-auto text-slate-300" size={48} />
              <p className="mt-3 text-sm font-semibold text-slate-600">Cabang tidak ditemukan.</p>
              <button type="button" onClick={resetFilters} className="mt-3 text-xs font-bold text-accent hover:underline">
                Reset pencarian
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-primary px-6 py-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <MapPinned size={32} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">Tidak menemukan cabang terdekat?</h2>
                <p className="mt-1 max-w-2xl text-xs leading-5 text-white/75">
                  Lihat semua daftar cabang Gadai Sakti di seluruh Indonesia atau hubungi kami untuk informasi lebih lanjut.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-primary"
              >
                Lihat Semua Lokasi
              </button>
              <a
                href="mailto:info@gadaisakti.id"
                className="rounded-lg bg-accent px-4 py-2.5 text-xs font-bold text-white"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className={`appearance-none rounded-full border py-2 pl-4 pr-8 text-xs font-bold outline-none transition ${
          value
            ? 'border-primary bg-primary text-white'
            : 'border-primary/25 bg-white text-primary hover:border-primary'
        }`}
      >
        <option value="">{label}</option>
        {options.map(option => (
          <option key={option} value={option} className="bg-white text-slate-800">
            {normalizeLabel(option)}
          </option>
        ))}
      </select>
      <ChevronDown className={`pointer-events-none absolute right-3 ${value ? 'text-white' : 'text-primary'}`} size={13} />
    </label>
  )
}
