import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await queryRows<any>(
    `SELECT id, title, slug, excerpt, content, cover_image_url, author, category, published_at, read_time, status, created_at, updated_at
     FROM articles ORDER BY created_at DESC`
  )
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim()
  const excerpt = String(body.excerpt || '').trim()
  const content = String(body.content || '').trim()
  const category = String(body.category || 'Edukasi').trim()
  const author = String(body.author || admin.name).trim()
  const slug = slugify(String(body.slug || title))
  const status = body.status === 'published' ? 'published' : 'draft'
  const coverImageUrl = String(body.coverImageUrl || '').trim() || null
  const readTime = Math.max(1, Number(body.readTime || 5))
  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date()

  if (!title || !slug || !excerpt || !content) {
    return NextResponse.json({ error: 'Judul, ringkasan, dan isi artikel wajib diisi.' }, { status: 400 })
  }

  try {
    const result = await execute(
      `INSERT INTO articles (title, slug, excerpt, content, cover_image_url, author, category, published_at, read_time, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt, content, coverImageUrl, author, category, publishedAt, readTime, status, admin.id]
    )
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug artikel sudah digunakan.' }, { status: 409 })
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan artikel.' }, { status: 500 })
  }
}
