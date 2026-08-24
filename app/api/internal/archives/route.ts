import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await queryRows<any>(
    `SELECT id, title, slug, description, year, document_type, file_url, cover_image_url, published_at, status, created_at, updated_at
     FROM company_archives ORDER BY year DESC, created_at DESC`
  )
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim()
  const slug = slugify(String(body.slug || title))
  const description = String(body.description || '').trim()
  const year = Number(body.year || new Date().getFullYear())
  const documentType = String(body.documentType || 'Laporan Keberlanjutan').trim()
  const fileUrl = String(body.fileUrl || '').trim() || null
  const coverImageUrl = String(body.coverImageUrl || '').trim() || null
  const status = body.status === 'published' ? 'published' : 'draft'
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date()

  if (!title || !slug || !description || !year) return NextResponse.json({ error: 'Data arsip belum lengkap.' }, { status: 400 })

  try {
    const result = await execute(
      `INSERT INTO company_archives (title, slug, description, year, document_type, file_url, cover_image_url, published_at, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, description, year, documentType, fileUrl, coverImageUrl, publishedAt, status, admin.id]
    )
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug arsip sudah digunakan.' }, { status: 409 })
    return NextResponse.json({ error: 'Gagal menyimpan arsip.' }, { status: 500 })
  }
}
