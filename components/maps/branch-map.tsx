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
  const branchMarkersRef = useRef<Map<string, any>>(new Map())
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
      branchMarkersRef.current.clear()
      leafletRef.current = null
    }
  }, [])

  useEffect(() => {
    const L = leafletRef.current
    const branchLayer = branchLayerRef.current

    if (!ready || !L || !branchLayer) return

    branchLayer.clearLayers()
    branchMarkersRef.current.clear()

    const validBranches = branches.filter(
      branch =>
        Number.isFinite(branch.latitude) &&
        Number.isFinite(branch.longitude) &&
        (branch.latitude !== 0 || branch.longitude !== 0)
    )

    validBranches.forEach(branch => {
      const marker = L.marker([branch.latitude, branch.longitude], {
        icon: createBranchIcon(L, false),
        riseOnHover: true,
        keyboard: true,
        title: branch.NamaCabang,
        alt: `Lokasi ${branch.NamaCabang}`,
      })

      marker.bindTooltip(buildTooltipHtml(branch), {
        direction: 'top',
        offset: [0, -36],
        opacity: 1,
        className: 'gs-map-tooltip',
      })

      marker.bindPopup(buildPopupHtml(branch), {
        className: 'gs-map-popup-shell',
        maxWidth: 310,
        minWidth: 230,
        offset: [0, -30],
      })

      marker.on('click', () => {
        onSelectBranch?.(branch)
      })

      marker.addTo(branchLayer)
      branchMarkersRef.current.set(branch.id, marker)
    })
  }, [branches, onSelectBranch, ready])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current

    if (!ready || !L || !map) return

    branchMarkersRef.current.forEach((marker, branchId) => {
      marker.setIcon(createBranchIcon(L, branchId === selectedBranchId))
    })

    const validBranches = branches.filter(
      branch =>
        Number.isFinite(branch.latitude) &&
        Number.isFinite(branch.longitude) &&
        (branch.latitude !== 0 || branch.longitude !== 0)
    )
    const selectedBranch = validBranches.find(branch => branch.id === selectedBranchId)

    if (selectedBranch) {
      map.flyTo([selectedBranch.latitude, selectedBranch.longitude], 14, { duration: 0.7 })
      return
    }

    if (validBranches.length > 0 && !userLocation) {
      const bounds = L.latLngBounds(validBranches.map(branch => [branch.latitude, branch.longitude]))
      map.fitBounds(bounds, { padding: [34, 34], maxZoom: 12 })
    }
  }, [branches, ready, selectedBranchId, userLocation])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapRef.current
    const userLayer = userLayerRef.current

    if (!ready || !L || !map || !userLayer) return

    userLayer.clearLayers()
    if (!userLocation) return

    const userIcon = L.divIcon({
      className: 'gs-leaflet-user-marker',
      html: '<span class="gs-leaflet-user-marker__pulse"></span><span class="gs-leaflet-user-marker__dot"></span>',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })

    L.marker([userLocation.latitude, userLocation.longitude], {
      icon: userIcon,
      keyboard: true,
      title: 'Lokasi Anda',
      alt: 'Lokasi Anda',
    })
      .bindTooltip(
        '<div class="gs-map-tooltip__content gs-map-tooltip__content--user"><strong>Lokasi Anda</strong><span>Posisi perangkat saat ini</span></div>',
        {
          direction: 'top',
          offset: [0, -12],
          opacity: 1,
          className: 'gs-map-tooltip gs-map-tooltip--user',
        }
      )
      .bindPopup('<div class="gs-map-popup"><strong>Lokasi Anda</strong><span>Posisi perangkat saat ini.</span></div>', {
        className: 'gs-map-popup-shell',
        offset: [0, -8],
      })
      .addTo(userLayer)

    if (!selectedBranchId) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 12, { duration: 0.7 })
    }
  }, [ready, selectedBranchId, userLocation])

  return (
    <div className="gs-map-frame relative h-[380px] w-full overflow-hidden rounded-2xl bg-slate-100 lg:h-[410px]">
      <div ref={containerRef} className="h-full w-full" aria-label="Peta lokasi cabang Gadai Sakti" />
      {ready ? (
        <div className="pointer-events-none absolute left-4 top-4 z-[500] hidden rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-primary shadow-lg backdrop-blur sm:block">
          Arahkan cursor ke marker untuk melihat cabang
        </div>
      ) : null}
      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 px-5 text-center text-sm text-slate-500">
          {loadFailed ? 'Peta gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.' : 'Memuat peta...'}
        </div>
      ) : null}
    </div>
  )
}

function createBranchIcon(L: any, isSelected: boolean) {
  return L.divIcon({
    className: `gs-leaflet-marker${isSelected ? ' is-selected' : ''}`,
    html: `
      <span class="gs-leaflet-marker__pin" aria-hidden="true">
        <span class="gs-leaflet-marker__core"></span>
      </span>
    `,
    iconSize: [42, 50],
    iconAnchor: [21, 46],
    popupAnchor: [0, -38],
    tooltipAnchor: [0, -34],
  })
}

function buildTooltipHtml(branch: Branch) {
  const distance =
    branch.distance !== undefined
      ? `<span class="gs-map-tooltip__distance">Sekitar ${branch.distance.toFixed(1)} km dari lokasi Anda</span>`
      : ''

  return `
    <div class="gs-map-tooltip__content">
      <span class="gs-map-tooltip__eyebrow">Cabang Gadai Sakti</span>
      <strong>${escapeHtml(branch.NamaCabang)}</strong>
      <span>${escapeHtml(branch.Kota || branch.Provinsi)}</span>
      ${distance}
    </div>
  `
}

function buildPopupHtml(branch: Branch) {
  const distance =
    branch.distance !== undefined
      ? `<span class="gs-map-popup__distance">Sekitar ${branch.distance.toFixed(1)} km dari lokasi Anda</span>`
      : ''
  const phone = branch.Phone
    ? `<span class="gs-map-popup__meta">Telp. ${escapeHtml(branch.Phone)}</span>`
    : ''
  const hours = branch.hours
    ? `<span class="gs-map-popup__meta">${escapeHtml(branch.hours)}</span>`
    : ''

  return `
    <div class="gs-map-popup">
      <span class="gs-map-popup__eyebrow">Lokasi Cabang</span>
      <strong>${escapeHtml(branch.NamaCabang)}</strong>
      <span class="gs-map-popup__city">${escapeHtml(branch.Kota || branch.Provinsi)}</span>
      <span class="gs-map-popup__address">${escapeHtml(branch.Alamat)}</span>
      ${distance}
      ${phone}
      ${hours}
      <span class="gs-map-popup__hint">Klik marker untuk memilih cabang ini.</span>
    </div>
  `
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
