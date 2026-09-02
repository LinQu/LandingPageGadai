import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, idOf, orderOf, statusOf, text } from '@/lib/internal/pawn'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  let sql = `
    SELECT 
      p.id, p.category_id, p.brand_id, p.name, p.slug, p.description, p.search_keywords, p.image_url, p.sort_order, p.status,
      c.name as category_name,
      b.name as brand_name,
      COUNT(v.id) as variant_count
    FROM pawn_products p
    LEFT JOIN pawn_categories c ON c.id = p.category_id
    LEFT JOIN pawn_brands b ON b.id = p.brand_id
    LEFT JOIN pawn_product_variants v ON v.product_id = p.id
  `
  const params: unknown[] = []
  if (q) {
    sql += ` WHERE LOWER(p.name) LIKE ? OR LOWER(p.slug) LIKE ? OR LOWER(b.name) LIKE ? OR LOWER(c.name) LIKE ?`
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`)
  }
  sql += `
    GROUP BY p.id, p.category_id, p.brand_id, p.name, p.slug, p.description, p.search_keywords, p.image_url, p.sort_order, p.status, c.name, b.name
    ORDER BY p.sort_order ASC, p.name ASC
  `
  const rows = await queryRows(sql, params)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const x = await request.json().catch(() => ({}))
  const categoryId = idOf(x.categoryId)
  const brandId = idOf(x.brandId)
  const name = text(x.name, 180)
  const slug = slugify(text(x.slug, 190) || name)
  const description = text(x.description, 65535) || null
  const searchKeywords = text(x.searchKeywords, 65535) || null
  const imageUrl = text(x.imageUrl, 1000) || null
  const sortOrder = orderOf(x.sortOrder)
  const status = statusOf(x.status)

  if (!categoryId || !brandId || !name) {
    return NextResponse.json({ error: 'Kategori, brand, dan nama produk wajib diisi.' }, { status: 400 })
  }

  const cat = (await queryRows(`SELECT id FROM pawn_categories WHERE id = ?`, [categoryId]))[0]
  const br = (await queryRows(`SELECT id FROM pawn_brands WHERE id = ?`, [brandId]))[0]
  if (!cat || !br) {
    return NextResponse.json({ error: 'Kategori atau brand tidak valid.' }, { status: 400 })
  }

  const res = await execute(
    `INSERT INTO pawn_products (category_id, brand_id, name, slug, description, search_keywords, image_url, sort_order, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [categoryId, brandId, name, slug, description, searchKeywords, imageUrl, sortOrder, status]
  )
  await audit(admin.id, 'pawn_product', res.insertId, 'create', null, { id: res.insertId, categoryId, brandId, name, slug, status })
  return NextResponse.json({ ok: true, id: res.insertId }, { status: 201 })
}
