import { NextResponse } from 'next/server'
import { archiveSeed } from '@/lib/content/archive-seed'
import { isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ArchiveRow = {
  id: number
  title: string
  slug: string
  description: string
  year: number
  document_type: string
  file_url: string | null
  cover_image_url: string | null
  published_at: string | Date
}

function seedData() {
  return archiveSeed.map(item => ({ ...item, publishedAt: item.publishedAt.toISOString() }))
}

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ source: 'dummy', data: seedData() })

  try {
    const rows = await queryRows<ArchiveRow>(
      `SELECT id, title, slug, description, year, document_type, file_url, cover_image_url, published_at
       FROM company_archives
       WHERE status = 'published'
       ORDER BY year DESC, published_at DESC`
    )

    if (rows.length === 0) return NextResponse.json({ source: 'dummy', data: seedData() })

    return NextResponse.json({
      source: 'mysql',
      data: rows.map(row => ({
        id: String(row.id),
        title: row.title,
        slug: row.slug,
        description: row.description,
        year: Number(row.year),
        documentType: row.document_type,
        fileUrl: row.file_url || '',
        coverImage: row.cover_image_url || '',
        publishedAt: new Date(row.published_at).toISOString(),
      })),
    })
  } catch (error) {
    console.error('Public archive fallback to dummy:', error)
    return NextResponse.json({ source: 'dummy', data: seedData() })
  }
}
