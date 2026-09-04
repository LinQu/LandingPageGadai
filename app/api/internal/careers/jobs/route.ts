import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { slugify } from '@/lib/internal/slug'

export const runtime = 'nodejs'

function normalizeApplicationUrl(value: unknown) {
  const applicationUrl = String(value || '').trim()
  if (!applicationUrl) return null
  try {
    const parsed = new URL(applicationUrl)
    return parsed.protocol === 'https:' ? applicationUrl : null
  } catch {
    return null
  }
}

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await queryRows<any>(`SELECT * FROM job_positions ORDER BY created_at DESC`)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim()
  const slug = slugify(String(body.slug || title))
  const summary = String(body.summary || '').trim()
  const description = String(body.description || '').trim()
  const responsibilities = String(body.responsibilities || '').trim()
  const qualifications = String(body.qualifications || '').trim()
  const benefits = String(body.benefits || '').trim()
  const locationCity = String(body.locationCity || '').trim()
  const locationProvince = String(body.locationProvince || '').trim()
  const placementDetail = String(body.placementDetail || '').trim() || null
  if (!title || !slug || !summary || !description || !locationCity || !locationProvince) {
    return NextResponse.json({ error: 'Judul, ringkasan, deskripsi, dan lokasi wajib diisi.' }, { status: 400 })
  }

  const status = ['published', 'closed'].includes(body.status) ? body.status : 'draft'
  const rawApplicationUrl = String(body.applicationUrl || '').trim()
  const applicationUrl = normalizeApplicationUrl(rawApplicationUrl)
  if (rawApplicationUrl && !applicationUrl) {
    return NextResponse.json({ error: 'Link lamaran harus berupa URL HTTPS yang valid.' }, { status: 400 })
  }
  if (status === 'published' && !applicationUrl) {
    return NextResponse.json({ error: 'Link lamaran wajib diisi sebelum lowongan dipublish.' }, { status: 400 })
  }

  try {
    const result = await execute(`INSERT INTO job_positions
      (title, slug, summary, description, responsibilities, qualifications, benefits, location_city, location_province, placement_detail, employment_type, work_mode, experience_level, education, salary_min, salary_max, application_deadline, application_url, published_at, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      title, slug, summary, description, responsibilities, qualifications, benefits, locationCity, locationProvince, placementDetail,
      String(body.employmentType || 'Full Time'), String(body.workMode || 'On Site'), String(body.experienceLevel || 'Fresh Graduate'), String(body.education || 'SMA/SMK'),
      body.salaryMin ? Number(body.salaryMin) : null, body.salaryMax ? Number(body.salaryMax) : null,
      body.applicationDeadline ? new Date(body.applicationDeadline) : null, applicationUrl,
      body.publishedAt ? new Date(body.publishedAt) : (status === 'published' ? new Date() : null), status, admin.id,
    ])
    return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug lowongan sudah digunakan.' }, { status: 409 })
    console.error(error)
    return NextResponse.json({ error: 'Gagal menyimpan lowongan.' }, { status: 500 })
  }
}
