import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { execute, isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database karir belum dikonfigurasi.' }, { status: 503 })
  const { slug } = await context.params
  const body = await request.json().catch(() => ({}))
  const fullName = String(body.fullName || '').trim()
  const province = String(body.province || '').trim()
  const city = String(body.city || '').trim()
  const phone = String(body.phone || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const consent = body.consent === true
  if (!fullName || !province || !city || !phone || !email || !consent) return NextResponse.json({ error: 'Lengkapi data dan persetujuan penggunaan data.' }, { status: 400 })
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 })

  const jobs = await queryRows<{ id: number }>(`SELECT id FROM job_positions WHERE slug=? AND status='published' AND (application_deadline IS NULL OR application_deadline >= NOW()) LIMIT 1`, [slug])
  if (!jobs[0]) return NextResponse.json({ error: 'Lowongan tidak ditemukan atau sudah ditutup.' }, { status: 404 })

  const applicationCode = `GS-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`
  await execute(`INSERT INTO job_applications (job_position_id, application_code, full_name, province, city, phone, email, status, consent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())`, [jobs[0].id, applicationCode, fullName, province, city, phone, email])
  return NextResponse.json({ ok: true, applicationCode }, { status: 201 })
}
