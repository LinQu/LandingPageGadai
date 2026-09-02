import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { audit, itemFields } from '@/lib/internal/pawn'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const q = String(new URL(request.url).searchParams.get('q') || '').trim().toLowerCase()
  let sql = `SELECT id, name, slug, logo_url, sort_order, status FROM pawn_brands`
  const params: unknown[] = []
  if (q) {
    sql += ` WHERE LOWER(name) LIKE ? OR LOWER(slug) LIKE ?`
    params.push(`%${q}%`, `%${q}%`)
  }
  sql += ` ORDER BY sort_order ASC, name ASC`
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
  await audit(admin.id, 'pawn_brand', res.insertId, 'create', null, { id: res.insertId, ...v })
  return NextResponse.json({ ok: true, id: res.insertId }, { status: 201 })
}
