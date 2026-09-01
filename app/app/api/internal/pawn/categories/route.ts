import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { itemFields } from '@/lib/internal/pawn'
import { createCategory, listCategories } from '@/lib/pawn-catalog-store'

export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  const rows = listCategories()
    .filter(row => !q || [row.name, row.slug].join(' ').toLowerCase().includes(q))
    .map(row => ({ id: row.id, name: row.name, slug: row.slug, image_url: row.image_url, sort_order: row.sort_order, status: row.status }))
  return NextResponse.json({ data: rows })
}
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const v = itemFields(await request.json().catch(() => ({})), 'category')
  if (!v.name || !v.slug) return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 })
  const created = createCategory({ name: v.name, slug: v.slug, imageUrl: v.image || undefined, sortOrder: v.sortOrder, status: v.status })
  return NextResponse.json({ ok:true,id:created.id }, {status:201})
}
