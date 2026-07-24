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
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0
}

function normalizeBranch(item: BranchApiItem, latitude: number, longitude: number): Branch {
  const branchLatitude = toNumber(item.lat ?? item.Lat ?? item.Latitude ?? item.latitude)
  const branchLongitude = toNumber(item.long ?? item.Long ?? item.Longitude ?? item.longitude)

  return {
    id: item.kode ?? item.KodeCabang ?? '',
    NamaCabang: item.namaCabang ?? item.NamaCabang ?? '',
    Kota: item.kota ?? item.Kota ?? '',
    Provinsi: item.provinsi ?? item.Provinsi ?? '',
    Alamat: item.alamat ?? item.Alamat ?? '',
    Phone: item.phone ?? item.telepon ?? item.Telepon ?? '',
    latitude: branchLatitude,
    longitude: branchLongitude,
    hours: item.jamOperasional ?? item.JamOperasional,
    distance: calculateDistance(longitude,latitude,  branchLatitude, branchLongitude),
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

// Get all branches
export async function getBranches(latitude = 0, longitude = 0): Promise<Branch[]> {
  return getBranchesFromApi(latitude, longitude)
}

// Get all branches for existing callers
export async function getBranchesForListing(): Promise<Branch[]> {
  return getBranches(0, 0)
}

// Search branches by city or name
export async function searchBranches(query: string): Promise<Branch[]> {
  const lowerQuery = query.toLowerCase()
  const branches = await getBranches(0, 0)

  return branches.filter(b =>
    b.NamaCabang.toLowerCase().includes(lowerQuery) ||
    b.Kota.toLowerCase().includes(lowerQuery) ||
    b.Alamat.toLowerCase().includes(lowerQuery)
  )
}

// Get branches by city
export async function getBranchesByCity(city: string): Promise<Branch[]> {
  const branches = await getBranches(0, 0)

  return branches.filter(b => b.Kota === city)
}

// Get branch by ID
export async function getBranchForDetail(id: string): Promise<Branch | null> {
  const branches = await getBranches(0, 0)

  return branches.find(b => b.id === id) || null
}

// Get unique cities
export async function getCities(): Promise<string[]> {
  const branches = await getBranches(0, 0)
  return [...new Set(branches.map(b => b.Kota))].sort()
}

// Get unique provinces
export async function getProvinces(): Promise<string[]> {
  const branches = await getBranches(0, 0)
  return [...new Set(branches.map(b => b.Provinsi))].sort()
}

// Calculate distance (mock - in real app use geolocation)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
