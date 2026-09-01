import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params

  if (isDatabaseConfigured()) {
    try {
      const rows = await queryRows<ArticleRow>(
        `SELECT id, title, slug, excerpt, content, cover_image_url, author, category, published_at, read_time
         FROM articles
         WHERE slug = ? AND status = 'published' AND published_at <= NOW()
         LIMIT 1`,
        [slug]
      )
      const row = rows[0]
      if (row) {
        return NextResponse.json({
          source: 'mysql',
          data: {
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
          },
        })
      }
    } catch (error) {
      console.error('Public article detail fallback to dummy:', error)
    }
  }

  const article = articleSeed.find(item => item.slug === slug)
  if (!article) return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 })
  return NextResponse.json({ source: 'dummy', data: { ...article, publishedAt: article.publishedAt.toISOString() } })
}
