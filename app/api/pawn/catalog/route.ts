import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/internal/db'
import { calculateEstimatedMin } from '@/lib/services/simulation.service'

export const runtime = 'nodejs'

type DbCategory = {
  id: number
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  status: 'active' | 'inactive'
}

type DbBrand = {
  id: number
  name: string
  slug: string
  logo_url: string | null
  sort_order: number
  status: 'active' | 'inactive'
}

type DbProduct = {
  id: number
  category_id: number
  brand_id: number
  name: string
  slug: string
  description: string | null
  search_keywords: string | null
  image_url: string | null
  sort_order: number
  status: 'active' | 'inactive'
}

type DbVariant = {
  id: number
  product_id: number
  name: string
  api_code: string
  default_price: number | null
  internal_note: string | null
  sort_order: number
  status: 'active' | 'inactive'
}

function resolveCategoryImage(cat: DbCategory): string | null {
  if (cat.image_url) return cat.image_url
  const upper = cat.name.toUpperCase()
  if (upper.includes('HP') || upper.includes('SMARTPHONE') || upper.includes('HANDPHONE')) return '/HP.png'
  if (upper.includes('LAPTOP') || upper.includes('NOTEBOOK')) return '/LPTP.png'
  return null
}

export async function GET() {
  try {
    const categories = await queryRows<DbCategory>(
      `SELECT id, name, slug, image_url, sort_order, status FROM pawn_categories WHERE status = 'active' ORDER BY sort_order ASC, name ASC`
    )
    const brands = await queryRows<DbBrand>(
      `SELECT id, name, slug, logo_url, sort_order, status FROM pawn_brands WHERE status = 'active' ORDER BY sort_order ASC, name ASC`
    )
    const products = await queryRows<DbProduct>(
      `SELECT id, category_id, brand_id, name, slug, description, search_keywords, image_url, sort_order, status FROM pawn_products WHERE status = 'active' ORDER BY sort_order ASC, name ASC`
    )
    const variants = await queryRows<DbVariant>(
      `SELECT id, product_id, name, api_code, default_price, internal_note, sort_order, status FROM pawn_product_variants WHERE status = 'active' ORDER BY sort_order ASC, name ASC`
    )

    const brandsMap = new Map<number, DbBrand>(brands.map(b => [b.id, b]))
    const variantsByProduct = new Map<number, DbVariant[]>()
    for (const v of variants) {
      const list = variantsByProduct.get(v.product_id) || []
      list.push(v)
      variantsByProduct.set(v.product_id, list)
    }

    const catalog = categories.map(cat => {
      // Find all products in this category
      const categoryProducts = products.filter(p => p.category_id === cat.id)

      // Find all unique brands with products in this category
      const brandIds = Array.from(new Set(categoryProducts.map(p => p.brand_id)))
      const categoryBrands = brandIds
        .map(bid => brandsMap.get(bid))
        .filter((b): b is DbBrand => Boolean(b))
        .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
        .map(b => {
          const brandProducts = categoryProducts
            .filter(p => p.brand_id === b.id)
            .map(p => {
              const pVariants = variantsByProduct.get(p.id) || []
              return {
                id: String(p.id),
                category: cat.name.toUpperCase(),
                name: p.name,
                aliases: (p.search_keywords || '').split(',').map(s => s.trim()).filter(Boolean),
                summary: p.description || p.name,
                imageUrl: p.image_url,
                specs: pVariants.map(v => {
                  const defaultPrice = v.default_price ? Number(v.default_price) : undefined
                  return {
                    id: String(v.id),
                    label: v.name,
                    apiCode: v.api_code,
                    note: v.internal_note || undefined,
                    minValuation: defaultPrice ? calculateEstimatedMin(defaultPrice) : undefined,
                    maxValuation: defaultPrice || undefined,
                  }
                }),
              }
            })

          return {
            id: String(b.id),
            kodekat: cat.name.toUpperCase(),
            name: b.name,
            slug: b.slug,
            logoUrl: b.logo_url,
            sortOrder: b.sort_order,
            status: b.status,
            products: brandProducts,
          }
        })

      return {
        id: String(cat.id),
        kode: cat.name.toUpperCase(),
        name: cat.name,
        icon: cat.name.toUpperCase().includes('LAPTOP') ? '💻' : '📱',
        imageUrl: resolveCategoryImage(cat),
        sortOrder: cat.sort_order,
        status: cat.status,
        brands: categoryBrands,
      }
    })

    return NextResponse.json({ data: catalog })
  } catch (error) {
    console.error('Error loading pawn catalog from MySQL:', error)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}