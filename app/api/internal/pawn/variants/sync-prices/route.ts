import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { fetchFromNss } from '@/lib/internal/nss'

export const runtime = 'nodejs'

export async function POST(_request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const variants = await queryRows<{ id: number; name: string; api_code: string; default_price: number | null }>(
    `SELECT id, name, api_code, default_price FROM pawn_product_variants WHERE api_code IS NOT NULL AND api_code <> '' AND api_code <> '-' AND status = 'active'`
  )

  const results: { id: number; name: string; apiCode: string; status: string; price?: number; error?: string }[] = []

  for (const v of variants) {
    try {
      const data = await fetchFromNss(v.api_code)
      if (data?.Detail && Array.isArray(data.Detail) && data.Detail.length > 0) {
        const prices = data.Detail
          .map((d: any) => Number(d.hargamaxcair || 0))
          .filter((p: number) => !isNaN(p) && p > 0)

        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
        if (maxPrice > 0) {
          const roundedPrice = Math.round(maxPrice)
          await execute(`UPDATE pawn_product_variants SET default_price = ? WHERE id = ?`, [roundedPrice, v.id])
          results.push({ id: v.id, name: v.name, apiCode: v.api_code, status: 'updated', price: roundedPrice })
          continue
        }
      }
      results.push({ id: v.id, name: v.name, apiCode: v.api_code, status: 'no_price_in_api' })
    } catch (err: any) {
      results.push({ id: v.id, name: v.name, apiCode: v.api_code, status: 'error', error: err.message })
    }
  }

  return NextResponse.json({
    ok: true,
    total: variants.length,
    updated: results.filter(r => r.status === 'updated').length,
    results,
  })
}

