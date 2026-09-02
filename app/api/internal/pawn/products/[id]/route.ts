import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, idOf, orderOf, statusOf, text } from '@/lib/internal/pawn'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const productId = idOf(rawId)
  if (!productId) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  const product = (await queryRows(`SELECT * FROM pawn_products WHERE id = ?`, [productId]))[0]
  if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  const variants = await queryRows(
    `SELECT id, product_id, name, api_code, default_price, internal_note, sort_order, status 
     FROM pawn_product_variants 
     WHERE product_id = ? 
     ORDER BY sort_order ASC, name ASC`,
    [productId]
  )

  return NextResponse.json({
    data: {
      id: product.id,
      category_id: product.category_id,
      brand_id: product.brand_id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      search_keywords: product.search_keywords,
      image_url: product.image_url,
      sort_order: product.sort_order,
      status: product.status,
      variants,
    },
  })
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_products WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  const x = await request.json().catch(() => ({}))
  const categoryId = idOf(x.categoryId) || existing.category_id
  const brandId = idOf(x.brandId) || existing.brand_id
  const name = text(x.name, 180) || existing.name
  const slug = slugify(text(x.slug, 190) || name)
  const description = x.description !== undefined ? (text(x.description, 65535) || null) : existing.description
  const searchKeywords = x.searchKeywords !== undefined ? (text(x.searchKeywords, 65535) || null) : existing.search_keywords
  const imageUrl = x.imageUrl !== undefined ? (text(x.imageUrl, 1000) || null) : existing.image_url
  const sortOrder = x.sortOrder !== undefined ? orderOf(x.sortOrder) : existing.sort_order
  const status = x.status !== undefined ? statusOf(x.status) : existing.status

  await execute(
    `UPDATE pawn_products SET category_id = ?, brand_id = ?, name = ?, slug = ?, description = ?, search_keywords = ?, image_url = ?, sort_order = ?, status = ? WHERE id = ?`,
    [categoryId, brandId, name, slug, description, searchKeywords, imageUrl, sortOrder, status, id]
  )
  await audit(admin.id, 'pawn_product', id, 'update', existing, { id, categoryId, brandId, name, slug, status })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_products WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

  await execute(`DELETE FROM pawn_product_variants WHERE product_id = ?`, [id])
  await execute(`DELETE FROM pawn_products WHERE id = ?`, [id])
  await audit(admin.id, 'pawn_product', id, 'delete', existing, null)
  return NextResponse.json({ ok: true })
}
