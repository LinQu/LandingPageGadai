import { NextRequest, NextResponse } from 'next/server'
import { careerSeed } from '@/lib/content/career-seed'
import { isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type JobRow = {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  responsibilities: string
  qualifications: string
  benefits: string
  location_city: string
  location_province: string
  placement_detail: string | null
  employment_type: string
  work_mode: string
  experience_level: string
  education: string
  salary_min: number | null
  salary_max: number | null
  application_deadline: string | null
  application_url: string | null
  published_at: string | null
  status: 'draft' | 'published' | 'closed'
}

function lines(value: string) {
  return String(value || '').split('\n').map(v => v.trim()).filter(Boolean)
}

function mapJob(row: JobRow) {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    responsibilities: lines(row.responsibilities),
    qualifications: lines(row.qualifications),
    benefits: lines(row.benefits),
    locationCity: row.location_city,
    locationProvince: row.location_province,
    placementDetail: row.placement_detail || null,
    employmentType: row.employment_type,
    workMode: row.work_mode,
    experienceLevel: row.experience_level,
    education: row.education,
    salaryMin: row.salary_min == null ? null : Number(row.salary_min),
    salaryMax: row.salary_max == null ? null : Number(row.salary_max),
    applicationDeadline: row.application_deadline ? new Date(row.application_deadline).toISOString() : null,
    applicationUrl: row.application_url || null,
    publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
    status: row.status,
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  if (!isDatabaseConfigured()) {
    const seed = careerSeed.find(item => item.slug === slug)
    return NextResponse.json({ source: 'dummy', data: seed || null })
  }

  try {
    const rows = await queryRows<JobRow>(
      `SELECT id, title, slug, summary, description, responsibilities, qualifications, benefits,
        location_city, location_province, placement_detail, employment_type, work_mode, experience_level, education, salary_min, salary_max,
        application_deadline, application_url, published_at, status FROM job_positions
      WHERE slug=? AND status='published' AND (application_deadline IS NULL OR application_deadline >= NOW())
      LIMIT 1`,
      [slug]
    )

    if (rows.length === 0) {
      const seed = careerSeed.find(item => item.slug === slug)
      return NextResponse.json({ source: 'dummy', data: seed || null })
    }

    return NextResponse.json({
      source: 'mysql',
      data: mapJob(rows[0]),
    })
  } catch (error) {
    console.error(`API /api/careers/${slug} error:`, error)
    const seed = careerSeed.find(item => item.slug === slug)
    return NextResponse.json({ source: 'dummy', data: seed || null })
  }
}

