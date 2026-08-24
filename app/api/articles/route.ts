import { NextResponse } from 'next/server'
import { articleSeed } from '@/lib/content/article-seed'
import { isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type ArticleRow = {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author: string
  category: string
  published_at: string | Date
  read_time: number
}

function serializeSeed() {
  return articleSeed
    .slice()
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .map(article => ({ ...article, publishedAt: article.publishedAt.toISOString() }))
}

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ source: 'dummy', data: serializeSeed() })
  }

  try {
    const rows = await queryRows<ArticleRow>(
      `SELECT id, title, slug, excerpt, content, cover_image_url, author, category, published_at, read_time
       FROM articles
       WHERE status = 'published' AND published_at <= NOW()
       ORDER BY published_at DESC`
    )

    if (rows.length === 0) return NextResponse.json({ source: 'dummy', data: serializeSeed() })

    return NextResponse.json({
      source: 'mysql',
      data: rows.map(row => ({
        id: String(row.id),
        title: row.title,
        slug: row.slug,
        description: row.excerpt,
        content: row.content,
        image: row.cover_image_url || '/placeholder.jpg',
        author: row.author,
        publishedAt: new Date(row.published_at).toISOString(),
        category: row.category,
        readTime: Number(row.read_time || 5),
      })),
    })
  } catch (error) {
    console.error('Public articles fallback to dummy:', error)
    return NextResponse.json({ source: 'dummy', data: serializeSeed() })
  }
}
