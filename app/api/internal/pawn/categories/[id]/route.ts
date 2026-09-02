import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, idOf, itemFields, slugify, text } from '@/lib/internal/pawn'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_categories WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const v = itemFields(body, 'category')
  if (!v.name || !v.slug) return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 })

  await execute(
    `UPDATE pawn_categories SET name = ?, slug = ?, image_url = ?, sort_order = ?, status = ? WHERE id = ?`,
    [v.name, v.slug, v.image, v.sortOrder, v.status, id]
  )

  // Sync selected existing brands
  if (Array.isArray(body.selectedBrandIds)) {
    const selectedBrandIds: number[] = body.selectedBrandIds
      .map(Number)
      .filter((bid: number) => Number.isSafeInteger(bid) && bid > 0)

    // Clear and insert selected brand links for this category
    await execute(`DELETE FROM pawn_category_brands WHERE category_id = ?`, [id])
    for (const bid of selectedBrandIds) {
      await execute(
        `INSERT IGNORE INTO pawn_category_brands (category_id, brand_id) VALUES (?, ?)`,
        [id, bid]
      ).catch(() => {})
    }
  }

  // Handle optional new brand creation if supplied alongside category update
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
          [id, newBrandId]
        ).catch(() => {})
      }
    } catch {
      // Ignore
    }
  }

  await audit(admin.id, 'pawn_category', id, 'update', existing, { id, ...v, selectedBrandIds: body.selectedBrandIds, newBrands: newBrandNames })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: rawId } = await context.params
  const id = idOf(rawId)
  if (!id) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const existing = (await queryRows(`SELECT * FROM pawn_categories WHERE id = ?`, [id]))[0]
  if (!existing) return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 })

  const products = await queryRows(`SELECT id FROM pawn_products WHERE category_id = ? LIMIT 1`, [id])
  if (products.length > 0) {
    return NextResponse.json({ error: 'Kategori masih memiliki produk terkait. Hapus atau pindahkan produk terlebih dahulu.' }, { status: 400 })
  }

  await execute(`DELETE FROM pawn_categories WHERE id = ?`, [id])
  await audit(admin.id, 'pawn_category', id, 'delete', existing, null)
  return NextResponse.json({ ok: true })
}
