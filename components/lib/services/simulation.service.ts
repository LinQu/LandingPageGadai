import type { 
  Branch, ItemCategory, ItemBrand, ItemSeries, ItemVariant, ItemStorage, 
  ItemYear, ItemColor, SimulationData, SimulationTenor 
} from '../types'
import {
  itemCategories, itemBrands, itemSeries, itemVariants,
  itemStorages, itemYears, itemColors,
} from '../dummy-data'
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

// Get all item categories
export async function getItemCategories(): Promise<ItemCategory[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return itemCategories
}

// Get brands for a category
export async function getBrandsByCategory(categoryId: string): Promise<ItemBrand[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemBrands.filter(b => b.kodekat === categoryId)
}

// Get series for a brand
export async function getSeriesByBrand(brandId: string): Promise<ItemSeries[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemSeries.filter(s => s.brandId === brandId)
}

// Get variants for a series
export async function getVariantsBySeries(seriesId: string): Promise<ItemVariant[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemVariants.filter(v => v.seriesId === seriesId)
}

// Get storage options for a variant
export async function getStoragesByVariant(variantId: string): Promise<ItemStorage[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemStorages.filter(s => s.variantId === variantId)
}

// Get years for a storage option
export async function getYearsByStorage(storageId: string): Promise<ItemYear[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemYears.filter(y => y.storageId === storageId)
}

// Get colors for a year
export async function getColorsByYear(yearId: string): Promise<ItemColor[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  return itemColors.filter(c => c.yearId === yearId)
}

// Get color by ID (for valuation)
export async function getColorById(id: string): Promise<ItemColor | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return itemColors.find(c => c.id === id) || null
}

// Calculate valuation with quantity
export async function calculateValuation(
  colorId: string,
  quantity: number = 1
): Promise<number> {
  const color = await getColorById(colorId)
  if (!color) return 0
  return color.valuation * quantity
}

// Get item name from color
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
