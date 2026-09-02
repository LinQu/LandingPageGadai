import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, idOf, itemFields } from '@/lib/internal/pawn'

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
  await audit(admin.id, 'pawn_category', id, 'update', existing, { id, ...v })
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
