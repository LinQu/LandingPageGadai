import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute } from '@/lib/internal/db'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

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
    await execute(
      `UPDATE company_archives SET title=?, slug=?, description=?, year=?, document_type=?, file_url=?, cover_image_url=?, published_at=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [title, slug, description, year, documentType, fileUrl, coverImageUrl, publishedAt, status, id]
    )
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug arsip sudah digunakan.' }, { status: 409 })
    return NextResponse.json({ error: 'Gagal memperbarui arsip.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Hanya super admin yang dapat menghapus arsip.' }, { status: 403 })
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  await execute('DELETE FROM company_archives WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
