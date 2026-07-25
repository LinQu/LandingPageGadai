'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Phone, Clock, Search } from 'lucide-react'
import { getBranches } from '@/lib/services/branch.service'
import type { Branch } from '@/lib/types'

const ITEMS_PER_PAGE = 9
const RADIUS_OPTIONS = [5, 10, 25, 50]
type SortOption = 'nearest' | 'az' | 'za' | 'city'

function formatWhatsappPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }

  if (digits.startsWith('62')) {
    return digits
  }

  return digits
}

function getWhatsappUrl(branch: Branch): string {
  const message = `(WEB) \nHallo Saya Tertarik Mau Tanya Gadai \n\n#${branch.id}`

  return `https://wa.me/${formatWhatsappPhone(branch.Phone)}?text=${encodeURIComponent(message)}`
}

function getGoogleMapsUrl(branch: Branch): string {
  return `https://www.google.com/maps?q=${branch.longitude},${branch.latitude}`
}

export default function CabangPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [provinces, setProvinces] = useState<string[]>([])
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSort, setSelectedSort] = useState<SortOption>('nearest')
  const [currentPage, setCurrentPage] = useState(1)
  const [userLatitude, setUserLatitude] = useState<number | null>(null)
  const [userLongitude, setUserLongitude] = useState<number | null>(null)
  const [locationMessage, setLocationMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadPageData = async (latitude: number, longitude: number) => {
      try {
        const branchesData = await getBranches(latitude, longitude)
        const provincesData = [...new Set(branchesData.map(branch => branch.Provinsi))].sort()

        if (!isMounted) {
          return
        }

        setBranches(branchesData)
        setProvinces(provincesData)
        setErrorMessage('')
      } catch {
        if (!isMounted) {
          return
        }

        setErrorMessage('Gagal mengambil data cabang.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (!navigator.geolocation) {
      setLocationMessage('Izinkan akses lokasi untuk menampilkan cabang terdekat.')
      void loadPageData(0, 0)
      return () => {
        isMounted = false
      }
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        setUserLatitude(position.coords.latitude)
        setUserLongitude(position.coords.longitude)
        setLocationMessage('')
        void loadPageData(position.coords.latitude, position.coords.longitude)
      },
      error => {
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
          setLocationMessage('Izinkan akses lokasi untuk menampilkan cabang terdekat.')
        } else {
          setLocationMessage('Izinkan akses lokasi untuk menampilkan cabang terdekat.')
        }
        setUserLatitude(null)
        setUserLongitude(null)
        setSelectedRadius(null)
        void loadPageData(0, 0)
      }
    )

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedProvince, selectedRadius, searchQuery, selectedSort])

  const branchesWithDistance = useMemo(() => {
    return branches
  }, [branches])

  const filteredBranches = useMemo(() => {
    let result = branchesWithDistance

    if (selectedProvince) {
      result = result.filter(branch => branch.Provinsi === selectedProvince)
    }

    if (selectedRadius !== null) {
      result = result.filter(branch => branch.distance !== undefined && branch.distance <= selectedRadius)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        branch =>
          branch.NamaCabang.toLowerCase().includes(query) ||
          branch.Kota.toLowerCase().includes(query) ||
          branch.Alamat.toLowerCase().includes(query)
      )
    }

    return result
  }, [branchesWithDistance, selectedProvince, selectedRadius, searchQuery])

  const sortedBranches = useMemo(() => {
    const result = [...filteredBranches]

    result.sort((a, b) => {
      if (selectedSort === 'nearest') {
        const distanceA = a.distance ?? Number.POSITIVE_INFINITY
        const distanceB = b.distance ?? Number.POSITIVE_INFINITY
        return distanceA - distanceB
      }

      if (selectedSort === 'za') {
        return b.NamaCabang.localeCompare(a.NamaCabang)
      }

      if (selectedSort === 'city') {
        return a.Kota.localeCompare(b.Kota) || a.NamaCabang.localeCompare(b.NamaCabang)
      }

      return a.NamaCabang.localeCompare(b.NamaCabang)
    })

    return result
  }, [filteredBranches, selectedSort])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(sortedBranches.length / ITEMS_PER_PAGE))
  }, [sortedBranches])

  const paginatedBranches = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedBranches.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, sortedBranches])

  const paginationStart = sortedBranches.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const paginationEnd = sortedBranches.length === 0 ? 0 : Math.min(currentPage * ITEMS_PER_PAGE, sortedBranches.length)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-bg-light py-12">
          <div className="text-center text-text-muted">Memuat cabang... </div>
        </main>
        <Footer />
      </>
    )
  }

  if (errorMessage) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-bg-light py-12">
          <div className="text-center text-text-muted">{errorMessage}</div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-bg-light py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Lokasi Cabang Kami
            </h1>
            <p className="text-lg text-text-muted max-w-2xl">
              Temukan cabang Gadai Sakti terdekat dari lokasi Anda.
            </p>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 space-y-4"
          >
            {/* Province */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedProvince('')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedProvince === ''
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                Semua Provinsi
              </button>
              {provinces.map(province => (
                <button
                  key={province}
                  onClick={() => setSelectedProvince(province)}
                  className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                    selectedProvince === province
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border hover:border-primary'
                  }`}
                >
                  {province}
                </button>
              ))}
            </div>

            {/* Radius */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedRadius(null)}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedRadius === null
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                Semua Radius
              </button>
              {RADIUS_OPTIONS.map(radius => (
                <button
                  key={radius}
                  disabled={userLatitude === null || userLongitude === null}
                  onClick={() => setSelectedRadius(radius)}
                  className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                    selectedRadius === radius
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border hover:border-primary'
                  } ${userLatitude === null || userLongitude === null ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {radius} KM
                </button>
              ))}
            </div>

            {locationMessage ? <p className="text-sm text-text-muted">{locationMessage}</p> : null}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 text-text-muted" size={20} />
              <input
                type="text"
                placeholder="Cari cabang atau kota..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            {/* Sorting */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSort('nearest')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedSort === 'nearest'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                Nearest
              </button>
              <button
                onClick={() => setSelectedSort('az')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedSort === 'az'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                A-Z
              </button>
              <button
                onClick={() => setSelectedSort('za')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedSort === 'za'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                Z-A
              </button>
              <button
                onClick={() => setSelectedSort('city')}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  selectedSort === 'city'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-border hover:border-primary'
                }`}
              >
                City
              </button>
            </div>
          </motion.div>

          {/* Branches Grid */}
          {sortedBranches.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBranches.map((branch, idx) => (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-lg font-bold text-primary mb-4">{branch.NamaCabang}</h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex gap-3">
                        <MapPin size={20} className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-primary">{branch.Kota}</p>
                          <p className="text-sm text-text-muted">{branch.Alamat}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Phone size={20} className="text-accent flex-shrink-0 mt-0.5" />
                        <a
                          href={getWhatsappUrl(branch)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:text-accent transition-colors"
                        >
                          {formatWhatsappPhone(branch.Phone)}
                        </a>
                      </div>

                      {branch.hours && (
                        <div className="flex gap-3">
                          <Clock size={20} className="text-accent flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-text-muted">{branch.hours}</p>
                        </div>
                      )}
                    </div>

                    {branch.distance !== undefined && branch.distance !== null && (
                      <div className="p-3 bg-primary/5 rounded-lg mb-4">
                        <p className="text-sm text-primary font-semibold">
                          Jarak: {branch.distance.toFixed(1)} km
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <a
                        href={getWhatsappUrl(branch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 border-2 border-primary text-center text-primary rounded-lg hover:bg-primary/5 transition-colors font-semibold"
                      >
                        Hubungi
                      </a>
                      <a
                        href={getGoogleMapsUrl(branch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Buka lokasi ${branch.NamaCabang} di Google Maps`}
                        title="Buka Google Maps"
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-dark"
                      >
                        <MapPin size={20} />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <p className="text-sm text-text-muted">
                  Menampilkan {paginationStart} - {paginationEnd} dari {sortedBranches.length} cabang
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
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🏢</div>
              <p className="text-text-muted">Tidak ada cabang yang sesuai dengan pencarian Anda.</p>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
