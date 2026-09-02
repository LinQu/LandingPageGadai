'use client'

import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { ExternalLink, LocateFixed, Loader2, MapPin, Navigation, Search } from 'lucide-react'
import { BranchMap } from '@/components/maps/branch-map'
import { calculateDistance, getBranches } from '@/lib/services/branch.service'
import type { Branch } from '@/lib/types'

type UserLocation = {
  latitude: number
  longitude: number
}

function matchesQuery(branch: Branch, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  return [branch.NamaCabang, branch.Kota, branch.Provinsi, branch.Alamat]
    .filter(Boolean)
    .some(value => value.toLowerCase().includes(normalized))
}

function getDirectionsUrl(branch: Branch) {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`
}

export function BranchLocatorSection() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [locating, setLocating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadBranches() {
      try {
        const data = await getBranches()
        if (!active) return
        setBranches(data)
        setMessage('')
      } catch {
        if (!active) return
        setMessage('Data cabang belum dapat dimuat. Silakan coba lagi atau buka halaman lokasi cabang.')
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadBranches()
    return () => {
      active = false
    }
  }, [])

  const filteredBranches = useMemo(
    () => branches.filter(branch => matchesQuery(branch, activeQuery)),
    [activeQuery, branches]
  )

  const nearestBranch = useMemo(() => {
    if (!userLocation) return null
    return [...branches]
      .filter(branch => branch.distance !== undefined)
      .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY))[0] ?? null
  }, [branches, userLocation])

  const selectedBranch = useMemo(() => {
    if (selectedBranchId) {
      const selected = branches.find(branch => branch.id === selectedBranchId)
      if (selected) return selected
    }

    if (activeQuery) return filteredBranches[0] ?? null
    if (nearestBranch) return nearestBranch
    return null
  }, [activeQuery, branches, filteredBranches, nearestBranch, selectedBranchId])

  const handleSelectBranch = useCallback((branch: Branch) => {
    setSelectedBranchId(branch.id)
  }, [])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchInput.trim()
    setActiveQuery(query)

    const firstMatch = branches.find(branch => matchesQuery(branch, query))
    setSelectedBranchId(query ? firstMatch?.id ?? null : null)

    if (query && !firstMatch) {
      setMessage(`Cabang dengan kata kunci “${query}” belum ditemukan.`)
    } else {
      setMessage('')
    }
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Browser Anda tidak mendukung akses lokasi.')
      return
    }

    setLocating(true)
    setMessage('')

    navigator.geolocation.getCurrentPosition(
      position => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setUserLocation(nextLocation)
        setSearchInput('')
        setActiveQuery('')
        setBranches(current =>
          current.map(branch => ({
            ...branch,
            distance:
              branch.latitude !== 0 || branch.longitude !== 0
                ? calculateDistance(
                    nextLocation.latitude,
                    nextLocation.longitude,
                    branch.latitude,
                    branch.longitude
                  )
                : undefined,
          }))
        )
        setSelectedBranchId(null)
        setLocating(false)
      },
      () => {
        setLocating(false)
        setMessage('Lokasi tidak dapat diakses. Pastikan izin lokasi pada browser sudah diaktifkan.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
  }

  const branchesForMap = activeQuery ? filteredBranches : branches

  return (
    <section id="lokasi-cabang" className="bg-white py-14 sm:py-16">
      <div className="site-container grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Lokasi Cabang</p>
          <h2 className="mt-3 max-w-xl text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-[44px]">
            Temukan Cabang Gadai Sakti Terdekat
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-text-muted sm:text-base">
            Kunjungi cabang terdekat dari lokasi Anda untuk proses gadai yang lebih cepat.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex max-w-xl rounded-md border border-slate-200 bg-white p-1.5 shadow-md shadow-slate-950/10">
            <label htmlFor="branch-search" className="sr-only">Cari lokasi cabang</label>
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                id="branch-search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Masukkan kota atau kecamatan"
                className="h-10 w-full bg-transparent pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="rounded bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Cari
            </button>
          </form>

          <button
            type="button"
            onClick={handleUseLocation}
            disabled={locating}
            className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-accent transition-colors hover:text-accent-dark disabled:opacity-60"
          >
            {locating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
            {locating ? 'Mencari lokasi Anda...' : 'Gunakan lokasi saya saat ini'}
          </button>

          {message ? <p className="mt-3 max-w-xl text-xs leading-5 text-slate-500">{message}</p> : null}

          {selectedBranch ? (
            <div className="mt-5 max-w-xl rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-primary">{selectedBranch.NamaCabang}</p>
                  <p className="mt-1 text-xs leading-5 text-text-muted">{selectedBranch.Alamat}</p>
                  {selectedBranch.distance !== undefined ? (
                    <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                      <Navigation size={13} /> Sekitar {selectedBranch.distance.toFixed(1)} km dari lokasi Anda
                    </p>
                  ) : null}
                </div>
                <MapPin size={20} className="shrink-0 text-accent" />
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                <a
                  href={getDirectionsUrl(selectedBranch)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent"
                >
                  Petunjuk arah <ExternalLink size={13} />
                </a>
                <Link href="/cabang" className="text-xs font-semibold text-primary hover:text-accent">
                  Lihat semua cabang
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <div className="absolute -inset-3 rounded-2xl bg-slate-100" />
          <div className="relative">
            {loading ? (
              <div className="flex h-[380px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 lg:h-[410px]">
                <Loader2 size={20} className="mr-2 animate-spin" /> Memuat lokasi cabang...
              </div>
            ) : (
              <BranchMap
                branches={branchesForMap}
                selectedBranchId={selectedBranch?.id ?? null}
                userLocation={userLocation}
                onSelectBranch={handleSelectBranch}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
