import type { Article } from '../types'
import { articles } from '../dummy-data'

// Get all articles
export async function getArticles(): Promise<Article[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return articles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
}

// Get article by slug
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return articles.find(a => a.slug === slug) || null
}

// Get article by ID
export async function getArticleById(id: string): Promise<Article | null> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return articles.find(a => a.id === id) || null
}

// Get articles by category
export async function getArticlesByCategory(category: string): Promise<Article[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return articles.filter(a => a.category === category)
}

// Search articles
export async function searchArticles(query: string): Promise<Article[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const lowerQuery = query.toLowerCase()
  return articles.filter(a =>
    a.title.toLowerCase().includes(lowerQuery) ||
    a.description.toLowerCase().includes(lowerQuery) ||
    a.content.toLowerCase().includes(lowerQuery)
  )
}

// Get featured articles (latest 3)
export async function getFeaturedArticles(): Promise<Article[]> {
  const allArticles = await getArticles()
  return allArticles.slice(0, 3)
}

// Get unique categories
export function getArticleCategories(): string[] {
  return [...new Set(articles.map(a => a.category))]
}
