import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { activeCodeIsTaken, audit, idOf, orderOf, statusOf, text } from '@/lib/internal/pawn'
import { fetchFromNss } from '@/lib/internal/nss'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  let sql = `SELECT id, product_id, name, api_code, default_price, internal_note, sort_order, status FROM pawn_product_variants`
  const params: unknown[] = []
  if (q) {
    sql += ` WHERE LOWER(name) LIKE ? OR LOWER(api_code) LIKE ?`
    params.push(`%${q}%`, `%${q}%`)
  }
  sql += ` ORDER BY sort_order ASC, name ASC`
  const rows = await queryRows(sql, params)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const x = await request.json().catch(() => ({}))
  const productId = idOf(x.productId)
  const name = text(x.name, 180)
  const apiCode = text(x.apiCode, 190)
  const defaultPrice = x.defaultPrice === undefined || x.defaultPrice === null || x.defaultPrice === '' ? null : Number(x.defaultPrice)
  const internalNote = text(x.internalNote, 65535) || null
  const sortOrder = orderOf(x.sortOrder)
  const status = statusOf(x.status)

  if (!productId || !name) {
    return NextResponse.json({ error: 'Produk dan nama variant wajib diisi.' }, { status: 400 })
  }

  let resolvedDefaultPrice = defaultPrice
  if (apiCode && (!resolvedDefaultPrice || resolvedDefaultPrice <= 0)) {
    try {
      const nssData = await fetchFromNss(apiCode)
      if (nssData?.Detail && Array.isArray(nssData.Detail) && nssData.Detail.length > 0) {
        const prices = nssData.Detail
          .map((d: any) => Number(d.hargamaxcair || 0))
          .filter((p: number) => !isNaN(p) && p > 0)
        if (prices.length > 0) {
          resolvedDefaultPrice = Math.round(Math.max(...prices))
        }
      }
    } catch {
      // Abaikan jika API NSS tidak dapat dihubungi saat pembuatan
    }
  }

  const res = await execute(
    `INSERT INTO pawn_product_variants (product_id, name, api_code, default_price, internal_note, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [productId, name, apiCode, resolvedDefaultPrice, internalNote, sortOrder, status]
  )
  await audit(admin.id, 'pawn_variant', res.insertId, 'create', null, { id: res.insertId, productId, name, apiCode, defaultPrice: resolvedDefaultPrice, status })
  return NextResponse.json({ ok: true, id: res.insertId, defaultPrice: resolvedDefaultPrice }, { status: 201 })
}
