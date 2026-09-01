import type { Branch } from '../types'

const BRANCH_ROUTE = '/api/cabang'

type BranchApiItem = {
  kode?: string
  KodeCabang?: string
  namaCabang?: string
  NamaCabang?: string
  kota?: string
  Kota?: string
  provinsi?: string
  Provinsi?: string
  alamat?: string
  Alamat?: string
  phone?: string
  telepon?: string
  Telepon?: string
  long?: string | number
  Long?: string | number
  Longitude?: string | number
  longitude?: string | number
  lat?: string | number
  Lat?: string | number
  Latitude?: string | number
  latitude?: string | number
  jamOperasional?: string
  JamOperasional?: string
}

type BranchApiResponse = {
  status?: string
  Detail?: BranchApiItem[]
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value.trim()) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0
}

function normalizeBranch(item: BranchApiItem, latitude: number, longitude: number): Branch {
  /**
   * CATATAN PENTING API CABANG:
   * Field koordinat dari API saat ini terbalik namanya.
   * Contoh API:
   *   long: "-6.2566"   -> sebenarnya LATITUDE
   *   lat:  "106.7685"  -> sebenarnya LONGITUDE
   *
   * Normalisasi dilakukan di sini supaya seluruh aplikasi tetap memakai
   * branch.latitude / branch.longitude dengan arti yang benar.
   */
  const branchLatitude = toNumber(item.long ?? item.Long ?? item.Latitude ?? item.latitude)
  const branchLongitude = toNumber(item.lat ?? item.Lat ?? item.Longitude ?? item.longitude)

  return {
    id: item.kode ?? item.KodeCabang ?? '',
    NamaCabang: item.namaCabang ?? item.NamaCabang ?? '',
    Kota: item.kota ?? item.Kota ?? '',
    Provinsi: item.provinsi ?? item.Provinsi ?? '',
    Alamat: (item.alamat ?? item.Alamat ?? '').trim(),
    Phone: item.phone ?? item.telepon ?? item.Telepon ?? '',
    latitude: branchLatitude,
    longitude: branchLongitude,
    hours: item.jamOperasional ?? item.JamOperasional,
    distance:
      (latitude !== 0 || longitude !== 0) && (branchLatitude !== 0 || branchLongitude !== 0)
        ? calculateDistance(latitude, longitude, branchLatitude, branchLongitude)
        : undefined,
  }
}

async function getBranchesFromApi(latitude = 0, longitude = 0): Promise<Branch[]> {
  const response = await fetch(BRANCH_ROUTE, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load branch data')
  }

  const responseData = (await response.json()) as BranchApiResponse

  if (!Array.isArray(responseData.Detail)) {
    throw new Error('Branch API response does not contain Detail')
  }

  return responseData.Detail
    .filter((item): item is BranchApiItem => Boolean(item?.kode || item?.KodeCabang))
    .map(item => normalizeBranch(item, latitude, longitude))
}

export async function getBranches(latitude = 0, longitude = 0): Promise<Branch[]> {
  return getBranchesFromApi(latitude, longitude)
}

export async function getBranchesForListing(): Promise<Branch[]> {
  return getBranches(0, 0)
}

export async function searchBranches(query: string): Promise<Branch[]> {
  const lowerQuery = query.toLowerCase()
  const branches = await getBranches(0, 0)

  return branches.filter(
    branch =>
      branch.NamaCabang.toLowerCase().includes(lowerQuery) ||
      branch.Kota.toLowerCase().includes(lowerQuery) ||
      branch.Provinsi.toLowerCase().includes(lowerQuery) ||
      branch.Alamat.toLowerCase().includes(lowerQuery)
  )
}

export async function getBranchesByCity(city: string): Promise<Branch[]> {
  const branches = await getBranches(0, 0)
  return branches.filter(branch => branch.Kota === city)
}

export async function getBranchForDetail(id: string): Promise<Branch | null> {
  const branches = await getBranches(0, 0)
  return branches.find(branch => branch.id === id) || null
}

export async function getCities(): Promise<string[]> {
  const branches = await getBranches(0, 0)
  return [...new Set(branches.map(branch => branch.Kota).filter(Boolean))].sort()
}

export async function getProvinces(): Promise<string[]> {
  const branches = await getBranches(0, 0)
  return [...new Set(branches.map(branch => branch.Provinsi).filter(Boolean))].sort()
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
