import type { 
  Branch, ItemCategory, ItemBrand, ItemSeries, ItemVariant, ItemStorage, 
  ItemYear, ItemColor, SimulationData 
} from '../types'
import {
  itemCategories, itemBrands, itemSeries, itemVariants,
  itemStorages, itemYears, itemColors,
} from '../dummy-data'
import { getBranchForDetail, getBranchesForListing } from './branch.service'

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
