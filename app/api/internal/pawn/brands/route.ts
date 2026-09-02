import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, itemFields } from '@/lib/internal/pawn'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  const categoryId = new URL(request.url).searchParams.get('categoryId')

  let sql = `
    SELECT 
      b.id, b.name, b.slug, b.logo_url, b.sort_order, b.status,
      COUNT(DISTINCT p.id) AS product_count,
      COUNT(DISTINCT c.id) AS category_count,
      GROUP_CONCAT(DISTINCT c.name ORDER BY c.name SEPARATOR ', ') AS category_names,
      GROUP_CONCAT(DISTINCT c.id SEPARATOR ',') AS category_ids
    FROM pawn_brands b
    LEFT JOIN pawn_category_brands cb ON cb.brand_id = b.id
    LEFT JOIN pawn_categories c ON c.id = cb.category_id
    LEFT JOIN pawn_products p ON p.brand_id = b.id
  `
  const params: unknown[] = []
  const conditions: string[] = []

  if (q) {
    conditions.push(`(LOWER(b.name) LIKE ? OR LOWER(b.slug) LIKE ?)`)
    params.push(`%${q}%`, `%${q}%`)
  }
  if (categoryId) {
    conditions.push(`(cb.category_id = ? OR p.category_id = ?)`)
    params.push(categoryId, categoryId)
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ')
  }

  sql += ` GROUP BY b.id ORDER BY b.sort_order ASC, b.name ASC`
  
  const rows = await queryRows(sql, params)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const v = itemFields(body, 'brand')
  if (!v.name || !v.slug) return NextResponse.json({ error: 'Nama brand wajib diisi.' }, { status: 400 })

  const res = await execute(
    `INSERT INTO pawn_brands (name, slug, logo_url, sort_order, status) VALUES (?, ?, ?, ?, ?)`,
    [v.name, v.slug, v.image, v.sortOrder, v.status]
  )
  const brandId = res.insertId

  // Link selected categories
  const selectedCategoryIds: number[] = Array.isArray(body.selectedCategoryIds)
    ? body.selectedCategoryIds.map(Number).filter((id: number) => Number.isSafeInteger(id) && id > 0)
    : []

  for (const catId of selectedCategoryIds) {
    await execute(
      `INSERT IGNORE INTO pawn_category_brands (category_id, brand_id) VALUES (?, ?)`,
      [catId, brandId]
    ).catch(() => {})
  }

  await audit(admin.id, 'pawn_brand', brandId, 'create', null, { id: brandId, ...v, selectedCategoryIds })
  return NextResponse.json({ ok: true, id: brandId }, { status: 201 })
}
