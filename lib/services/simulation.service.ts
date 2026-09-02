import type { Branch, SimulationData, SimulationTenor } from '../types'
import { getBranchForDetail, getBranchesForListing } from './branch.service'

export type BarangApiItem = {
  kodebarang?: string
  kodecabang?: string
  hargamaxcair?: string | number
}

export type BarangApiResponse = {
  status?: string
  Detail?: BarangApiItem[]
}

export interface BarangEstimate {
  kodeBarang: string
  kodeCabang: string
  maxCash: number
}

export interface SimulationPriceSummary {
  branchCode: string
  kodeBarang: string
  maxCash: number
  minCash: number
  sewaModal: number
  adminFee: number
  tenor: SimulationTenor
}

const ESTIMATE_FLOOR = 1000000

function roundUpToNearest500(amount: number): number {
  return Math.ceil(amount / 500) * 500
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : 0
}

function getMinEstimateRatio(maxCash: number): number {
  if (maxCash < 2000000) {
    return 0.9
  }

  if (maxCash < 5000000) {
    return 0.85
  }

  return 0.8
}

export function calculateEstimatedMin(maxCash: number): number {
  if (maxCash <= 0) {
    return ESTIMATE_FLOOR
  }

  const dynamicEstimate = roundUpToNearest500(maxCash * getMinEstimateRatio(maxCash))
  return Math.max(dynamicEstimate, ESTIMATE_FLOOR)
}

export function calculateSewaModal(maxCash: number, tenor: SimulationTenor): number {
  const rate = tenor === 15 ? 0.05 : 0.1
  return roundUpToNearest500(maxCash * rate)
}

export function calculateAdminFee(maxCash: number): number {
  return roundUpToNearest500(maxCash * 0.01)
}

export async function getBarangEstimates(noHP: string): Promise<BarangEstimate[]> {
  if (!noHP) {
    return []
  }

  const response = await fetch(`/api/barang?noHP=${encodeURIComponent(noHP)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load barang estimate data')
  }

  const responseData = (await response.json()) as BarangApiResponse

  if (!Array.isArray(responseData.Detail)) {
    return []
  }

  return responseData.Detail
    .filter((item): item is BarangApiItem => Boolean(item?.kodebarang && item?.kodecabang))
    .map(item => ({
      kodeBarang: item.kodebarang || '',
      kodeCabang: item.kodecabang || '',
      maxCash: toNumber(item.hargamaxcair),
    }))
    .filter(item => item.maxCash > 0)
}

// Get all branches
export async function getBranches(): Promise<Branch[]> {
  return getBranchesForListing()
}

// Get branch by ID
export async function getBranchById(id: string): Promise<Branch | null> {
  return getBranchForDetail(id)
}

// Get item name from simulation data
export function getItemNameFromSimulation(data: Partial<SimulationData>): string {
  if (data.itemName) {
    return [data.itemName, data.specification].filter(Boolean).join(' ')
  }

  const parts = [
    data.brand?.name,
    data.series?.name,
    data.variant?.name,
    data.storage?.name,
    data.year?.year,
    data.color?.name,
  ].filter(Boolean)
  
  return parts.join(' ')
}
