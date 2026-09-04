import type { FAQItem, Testimonial, ArchiveItem } from '../types'
import { faqs, testimonials, archiveItems } from '../dummy-data'

// ============ FAQ ============
export async function getFAQs(): Promise<FAQItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return faqs
}

export async function getFAQById(id: string): Promise<FAQItem | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return faqs.find(f => f.id === id) || null
}

export async function searchFAQs(query: string): Promise<FAQItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  const lowerQuery = query.toLowerCase()
  return faqs.filter(f =>
    f.question.toLowerCase().includes(lowerQuery) ||
    f.answer.toLowerCase().includes(lowerQuery)
  )
}

// ============ TESTIMONIALS ============
export async function getTestimonials(): Promise<Testimonial[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return testimonials
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return testimonials.find(t => t.id === id) || null
}

export async function getTestimonialsByRating(minRating: number): Promise<Testimonial[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return testimonials.filter(t => t.rating >= minRating)
}

export function getAverageRating(): number {
  if (testimonials.length === 0) return 4.9
  const sum = testimonials.reduce((acc, t) => acc + t.rating, 0)
  return Math.round((sum / testimonials.length) * 10) / 10
}

// ============ ARCHIVE ============
export async function getArchiveItems(limit?: number): Promise<ArchiveItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const sorted = archiveItems.sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime())
  return limit ? sorted.slice(0, limit) : sorted
}

export async function getArchiveItemById(id: string): Promise<ArchiveItem | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  return archiveItems.find(a => a.id === id) || null
}

export async function searchArchiveItems(query: string): Promise<ArchiveItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const lowerQuery = query.toLowerCase()
  return archiveItems.filter(a =>
    a.bookingNumber.toLowerCase().includes(lowerQuery) ||
    a.itemName.toLowerCase().includes(lowerQuery)
  )
}

export async function getArchiveItemsByStatus(status: 'active' | 'redeemed' | 'extended'): Promise<ArchiveItem[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return archiveItems.filter(a => a.status === status)
}

export function getArchiveStats() {
  return {
    total: archiveItems.length,
    active: archiveItems.filter(a => a.status === 'active').length,
    redeemed: archiveItems.filter(a => a.status === 'redeemed').length,
    extended: archiveItems.filter(a => a.status === 'extended').length,
  }
}
