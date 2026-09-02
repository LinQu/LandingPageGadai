import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { activeCodeIsTaken, audit, idOf, orderOf, statusOf, text } from '@/lib/internal/pawn'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_product_variants WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Variant tidak ditemukan.' }, { status: 404 })

  const x = await request.json().catch(() => ({}))
  const productId = idOf(x.productId) || existing.product_id
  const name = text(x.name, 180) || existing.name
  const apiCode = x.apiCode !== undefined ? text(x.apiCode, 190) : existing.api_code
  const defaultPrice = x.defaultPrice === undefined ? existing.default_price : (x.defaultPrice === null || x.defaultPrice === '' ? null : Number(x.defaultPrice))
  const internalNote = x.internalNote !== undefined ? (text(x.internalNote, 65535) || null) : existing.internal_note
  const sortOrder = x.sortOrder !== undefined ? orderOf(x.sortOrder) : existing.sort_order
  const status = x.status !== undefined ? statusOf(x.status) : existing.status

  if (apiCode && status === 'active' && !x.overrideActiveApiCode && await activeCodeIsTaken(apiCode, id)) {
    return NextResponse.json({ error: 'API code sudah digunakan oleh variant aktif lain.' }, { status: 409 })
  }

  let resolvedDefaultPrice = defaultPrice
  if (apiCode && (!resolvedDefaultPrice || resolvedDefaultPrice <= 0 || (x.apiCode && x.apiCode !== existing.api_code))) {
    try {
      const { fetchFromNss } = await import('@/lib/internal/nss')
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
      // Abaikan jika API NSS tidak dapat dihubungi saat update
    }
  }

  await execute(
    `UPDATE pawn_product_variants SET product_id = ?, name = ?, api_code = ?, default_price = ?, internal_note = ?, sort_order = ?, status = ? WHERE id = ?`,
    [productId, name, apiCode, resolvedDefaultPrice, internalNote, sortOrder, status, id]
  )
  await audit(admin.id, 'pawn_variant', id, 'update', existing, { id, productId, name, apiCode, defaultPrice: resolvedDefaultPrice, status })
  return NextResponse.json({ ok: true, defaultPrice: resolvedDefaultPrice })
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_product_variants WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Variant tidak ditemukan.' }, { status: 404 })

  await execute(`DELETE FROM pawn_product_variants WHERE id = ?`, [id])
  await audit(admin.id, 'pawn_variant', id, 'delete', existing, null)
  return NextResponse.json({ ok: true })
}
