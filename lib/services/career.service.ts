import type { CareerJob } from '@/lib/types'
import { careerSeed } from '@/lib/content/career-seed'

function reviveJob(raw: any): CareerJob {
  return {
    ...raw,
    id: String(raw.id),
    applicationDeadline: raw.applicationDeadline ? new Date(raw.applicationDeadline) : null,
    publishedAt: raw.publishedAt ? new Date(raw.publishedAt) : null,
    salaryMin: raw.salaryMin == null ? null : Number(raw.salaryMin),
    salaryMax: raw.salaryMax == null ? null : Number(raw.salaryMax),
    responsibilities: Array.isArray(raw.responsibilities) ? raw.responsibilities : [],
    qualifications: Array.isArray(raw.qualifications) ? raw.qualifications : [],
    benefits: Array.isArray(raw.benefits) ? raw.benefits : [],
  }
}

async function fetchJson(path: string) {
  const response = await fetch(path, { cache: 'no-store' })
  if (!response.ok) throw new Error(`Request gagal: ${response.status}`)
  return response.json()
}

export async function getCareerJobs(): Promise<CareerJob[]> {
  try {
    const payload = await fetchJson('/api/careers')
    return (payload.data || []).map(reviveJob)
  } catch {
    return careerSeed
  }
}

export async function getCareerJobBySlug(slug: string): Promise<CareerJob | null> {
  try {
    const payload = await fetchJson(`/api/careers/${encodeURIComponent(slug)}`)
    return payload.data ? reviveJob(payload.data) : null
  } catch {
    return careerSeed.find(job => job.slug === slug) || null
  }
}
