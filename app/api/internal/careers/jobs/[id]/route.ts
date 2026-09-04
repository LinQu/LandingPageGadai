import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute } from '@/lib/internal/db'
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

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim()
  const slug = slugify(String(body.slug || title))
  const status = ['published', 'closed'].includes(body.status) ? body.status : 'draft'
  if (!title || !slug || !String(body.summary || '').trim() || !String(body.description || '').trim() || !String(body.locationCity || '').trim() || !String(body.locationProvince || '').trim()) {
    return NextResponse.json({ error: 'Data lowongan belum lengkap.' }, { status: 400 })
  }

  const rawApplicationUrl = String(body.applicationUrl || '').trim()
  const applicationUrl = normalizeApplicationUrl(rawApplicationUrl)
  if (rawApplicationUrl && !applicationUrl) {
    return NextResponse.json({ error: 'Link lamaran harus berupa URL HTTPS yang valid.' }, { status: 400 })
  }
  if (status === 'published' && !applicationUrl) {
    return NextResponse.json({ error: 'Link lamaran wajib diisi sebelum lowongan dipublish.' }, { status: 400 })
  }

  const placementDetail = String(body.placementDetail || '').trim() || null

  try {
    await execute(`UPDATE job_positions SET title=?, slug=?, summary=?, description=?, responsibilities=?, qualifications=?, benefits=?, location_city=?, location_province=?, placement_detail=?, employment_type=?, work_mode=?, experience_level=?, education=?, salary_min=?, salary_max=?, application_deadline=?, application_url=?, published_at=?, status=?, updated_at=NOW() WHERE id=?`, [
      title, slug, String(body.summary).trim(), String(body.description).trim(), String(body.responsibilities || '').trim(), String(body.qualifications || '').trim(), String(body.benefits || '').trim(),
      String(body.locationCity).trim(), String(body.locationProvince).trim(), placementDetail, String(body.employmentType || 'Full Time'), String(body.workMode || 'On Site'), String(body.experienceLevel || 'Fresh Graduate'), String(body.education || 'SMA/SMK'),
      body.salaryMin ? Number(body.salaryMin) : null, body.salaryMax ? Number(body.salaryMax) : null,
      body.applicationDeadline ? new Date(body.applicationDeadline) : null, applicationUrl,
      body.publishedAt ? new Date(body.publishedAt) : (status === 'published' ? new Date() : null), status, id,
    ])
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Slug lowongan sudah digunakan.' }, { status: 409 })
    console.error(error)
    return NextResponse.json({ error: 'Gagal memperbarui lowongan.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Hanya super admin yang dapat menghapus lowongan.' }, { status: 403 })
  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  try {
    await execute('DELETE FROM job_positions WHERE id=?', [id])
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error?.code === 'ER_ROW_IS_REFERENCED_2') return NextResponse.json({ error: 'Lowongan sudah memiliki pelamar. Tutup lowongan, jangan dihapus.' }, { status: 409 })
    throw error
  }
}
