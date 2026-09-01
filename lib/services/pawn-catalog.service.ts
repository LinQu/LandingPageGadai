export type PawnCatalogSpec = {
  id: string
  label: string
  apiCode: string
  note?: string
  minValuation?: number
  maxValuation?: number
}

export type PawnCatalogProduct = {
  id: string
  category: string
  name: string
  aliases: string[]
  summary: string
  imageUrl?: string | null
  specs: PawnCatalogSpec[]
}

export type PawnCatalogBrand = {
  id: string
  kodekat: string
  name: string
  slug: string
  logoUrl?: string | null
  sortOrder: number
  status: 'active' | 'inactive'
  products: PawnCatalogProduct[]
}

export type PawnCatalogCategory = {
  id: string
  kode: string
  name: string
  icon: string
  imageUrl?: string | null
  sortOrder: number
  status: 'active' | 'inactive'
  brands: PawnCatalogBrand[]
}

export type PawnCatalogResponse = {
  data: PawnCatalogCategory[]
}

export async function getPawnCatalog(): Promise<PawnCatalogCategory[]> {
  const response = await fetch('/api/pawn/catalog', { cache: 'no-store' })
  if (!response.ok) {
    throw new Error('Failed to load pawn catalog')
  }

  const payload = (await response.json()) as PawnCatalogResponse
  return Array.isArray(payload.data) ? payload.data : []
}