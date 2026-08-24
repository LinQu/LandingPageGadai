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
  const excerpt = String(body.excerpt || '').trim()
  const content = String(body.content || '').trim()
  const category = String(body.category || 'Edukasi').trim()
  const author = String(body.author || admin.name).trim()
  const status = body.status === 'published' ? 'published' : 'draft'
  const coverImageUrl = String(body.coverImageUrl || '').trim() || null
  const readTime = Math.max(1, Number(body.readTime || 5))
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date()

  if (!title || !slug || !excerpt || !content) return NextResponse.json({ error: 'Data artikel belum lengkap.' }, { status: 400 })

  try {
    await execute(
      `UPDATE articles SET title=?, slug=?, excerpt=?, content=?, cover_image_url=?, author=?, category=?, published_at=?, read_time=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [title, slug, excerpt, content, coverImageUrl, author, category, publishedAt, readTime, status, id]
    )
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug artikel sudah digunakan.' }, { status: 409 })
    return NextResponse.json({ error: 'Gagal memperbarui artikel.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Hanya super admin yang dapat menghapus artikel.' }, { status: 403 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  await execute('DELETE FROM articles WHERE id = ?', [id])
  return NextResponse.json({ ok: true })
}
