import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, itemFields, slugify, text } from '@/lib/internal/pawn'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  
  let sql = `
    SELECT 
      c.id, c.name, c.slug, c.image_url, c.sort_order, c.status,
      COUNT(DISTINCT p.id) AS product_count,
      COUNT(DISTINCT b.id) AS brand_count,
      GROUP_CONCAT(DISTINCT b.name ORDER BY b.name SEPARATOR ', ') AS brand_names,
      GROUP_CONCAT(DISTINCT b.id SEPARATOR ',') AS brand_ids
    FROM pawn_categories c
    LEFT JOIN pawn_category_brands cb ON cb.category_id = c.id
    LEFT JOIN pawn_brands b ON b.id = cb.brand_id
    LEFT JOIN pawn_products p ON p.category_id = c.id
  `
  const params: unknown[] = []
  if (q) {
    sql += ` WHERE LOWER(c.name) LIKE ? OR LOWER(c.slug) LIKE ?`
    params.push(`%${q}%`, `%${q}%`)
  }
  sql += ` GROUP BY c.id ORDER BY c.sort_order ASC, c.name ASC`
  
  const rows = await queryRows(sql, params)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const v = itemFields(body, 'category')
  if (!v.name || !v.slug) return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 })

  const res = await execute(
    `INSERT INTO pawn_categories (name, slug, image_url, sort_order, status) VALUES (?, ?, ?, ?, ?)`,
    [v.name, v.slug, v.image, v.sortOrder, v.status]
  )
  const categoryId = res.insertId

  // Link selected existing brands
  const selectedBrandIds: number[] = Array.isArray(body.selectedBrandIds)
    ? body.selectedBrandIds.map(Number).filter((id: number) => Number.isSafeInteger(id) && id > 0)
    : []

  for (const brandId of selectedBrandIds) {
    await execute(
      `INSERT IGNORE INTO pawn_category_brands (category_id, brand_id) VALUES (?, ?)`,
      [categoryId, brandId]
    ).catch(() => {})
  }

  // Handle optional new brand creation if supplied alongside category
  const newBrandNames: string[] = Array.isArray(body.newBrands) 
    ? body.newBrands.map((b: string) => text(b, 120)).filter(Boolean)
    : []

  for (const brandName of newBrandNames) {
    const brandSlug = slugify(brandName)
    try {
      const brandRes = await execute(
        `INSERT INTO pawn_brands (name, slug, sort_order, status) 
         VALUES (?, ?, 0, 'active') 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [brandName, brandSlug]
      )
      const newBrandId = brandRes.insertId || (await queryRows<{ id: number }>(`SELECT id FROM pawn_brands WHERE slug = ?`, [brandSlug]))[0]?.id
      if (newBrandId) {
        await execute(
          `INSERT IGNORE INTO pawn_category_brands (category_id, brand_id) VALUES (?, ?)`,
          [categoryId, newBrandId]
        ).catch(() => {})
      }
    } catch {
      // Ignore
    }
  }

  await audit(admin.id, 'pawn_category', categoryId, 'create', null, { id: categoryId, ...v, selectedBrandIds, newBrands: newBrandNames })
  return NextResponse.json({ ok: true, id: categoryId }, { status: 201 })
}
