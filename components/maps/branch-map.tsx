'use client'

import { useEffect, useRef, useState } from 'react'
import type { Branch } from '@/lib/types'

type BranchMapProps = {
  branches: Branch[]
  selectedBranchId?: string | null
  userLocation?: { latitude: number; longitude: number } | null
  onSelectBranch?: (branch: Branch) => void
}

type LeafletWindow = Window & {
  L?: any
}

export function BranchMap({
  branches,
  selectedBranchId,
  userLocation,
  onSelectBranch,
}: BranchMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const branchLayerRef = useRef<any>(null)
  const userLayerRef = useRef<any>(null)
  const leafletRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    function initMap(attempt = 0) {
      if (cancelled || !containerRef.current || mapRef.current) return

      const L = (window as LeafletWindow).L
      if (!L) {
        if (attempt < 50) {
          timer = setTimeout(() => initMap(attempt + 1), 100)
        } else {
          setLoadFailed(true)
        }
        return
      }

      leafletRef.current = L
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      }).setView([-6.2, 106.82], 10)

      const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileAttribution =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ||
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: tileAttribution,
      }).addTo(map)

      branchLayerRef.current = L.featureGroup().addTo(map)
      userLayerRef.current = L.featureGroup().addTo(map)
      mapRef.current = map
      setReady(true)
    }

    initMap()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
      mapRef.current?.remove()
      mapRef.current = null
      branchLayerRef.current = null
      userLayerRef.current = null
      leafletRef.current = null
    }
  }, [])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current
    const branchLayer = branchLayerRef.current

    if (!ready || !L || !map || !branchLayer) return

    branchLayer.clearLayers()

    const validBranches = branches.filter(
      branch => Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude) && (branch.latitude !== 0 || branch.longitude !== 0)
    )

    const markerIcon = L.divIcon({
      className: 'gs-leaflet-marker',
      html: '<span class="gs-leaflet-marker__dot"></span>',
      iconSize: [34, 42],
      iconAnchor: [17, 39],
      popupAnchor: [0, -36],
    })

    validBranches.forEach(branch => {
      const marker = L.marker([branch.latitude, branch.longitude], { icon: markerIcon })
        .bindPopup(
          `<div class="gs-map-popup"><strong>${escapeHtml(branch.NamaCabang)}</strong><span>${escapeHtml(branch.Alamat)}</span></div>`
        )
        .on('click', () => onSelectBranch?.(branch))

      marker.addTo(branchLayer)
    })

    const selectedBranch = validBranches.find(branch => branch.id === selectedBranchId)

    if (selectedBranch) {
      map.flyTo([selectedBranch.latitude, selectedBranch.longitude], 14, { duration: 0.7 })
      return
    }

    if (validBranches.length > 0 && !userLocation) {
      const bounds = L.latLngBounds(validBranches.map(branch => [branch.latitude, branch.longitude]))
      map.fitBounds(bounds, { padding: [34, 34], maxZoom: 12 })
    }
  }, [branches, onSelectBranch, ready, selectedBranchId, userLocation])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current
    const userLayer = userLayerRef.current

    if (!ready || !L || !map || !userLayer) return

    userLayer.clearLayers()
    if (!userLocation) return

    const userIcon = L.divIcon({
      className: 'gs-leaflet-user-marker',
      html: '<span class="gs-leaflet-user-marker__dot"></span>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    })

    L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .bindPopup('Lokasi Anda')
      .addTo(userLayer)

    if (!selectedBranchId) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 12, { duration: 0.7 })
    }
  }, [ready, selectedBranchId, userLocation])

  return (
    <div className="relative h-[380px] w-full overflow-hidden rounded-xl bg-slate-100 lg:h-[410px]">
      <div ref={containerRef} className="h-full w-full" aria-label="Peta lokasi cabang Gadai Sakti" />
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-5 text-center text-sm text-slate-500">
          {loadFailed ? 'Peta gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.' : 'Memuat peta...'}
        </div>
      ) : null}
    </div>
  )
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#039;',
      '"': '&quot;',
    }
    return entities[char] ?? char
  })
}
