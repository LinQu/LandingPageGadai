import type { Article } from '../types'
import { articleSeed } from '../content/article-seed'

function reviveArticle(raw: any): Article {
  return {
    ...raw,
    id: String(raw.id),
    publishedAt: raw.publishedAt instanceof Date ? raw.publishedAt : new Date(raw.publishedAt),
    readTime: Number(raw.readTime || 5),
  }
}

async function fetchJson(path: string) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Request gagal: ${response.status}`)
  return response.json()
}

export async function getArticles(): Promise<Article[]> {
  try {
    const payload = await fetchJson('/api/articles')
    return (payload.data || []).map(reviveArticle)
  } catch {
    return articleSeed.slice().sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const payload = await fetchJson(`/api/articles/${encodeURIComponent(slug)}`)
    return payload.data ? reviveArticle(payload.data) : null
  } catch {
    return articleSeed.find(article => article.slug === slug) || null
  }
}

export async function getArticleById(id: string): Promise<Article | null> {
  const articles = await getArticles()
  return articles.find(article => article.id === id) || null
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const articles = await getArticles()
  return articles.filter(article => article.category === category)
}

export async function searchArticles(query: string): Promise<Article[]> {
  const articles = await getArticles()
  const lowerQuery = query.toLowerCase()
  return articles.filter(article =>
    article.title.toLowerCase().includes(lowerQuery) ||
    article.description.toLowerCase().includes(lowerQuery) ||
    article.content.toLowerCase().includes(lowerQuery)
  )
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const articles = await getArticles()
  return articles.slice(0, 3)
}

export function getArticleCategories(): string[] {
  return [...new Set(articleSeed.map(article => article.category))]
}
