import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { execute, isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database belum dikonfigurasi.' }, { status: 503 })
  }

  const { slug } = await context.params
  const body = await request.json().catch(() => ({}))

  const fullName = String(body.fullName || '').trim()
  const province = String(body.province || '').trim()
  const city = String(body.city || '').trim()
  const phone = String(body.phone || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const consent = body.consent === true

  if (!fullName || !province || !city || !phone || !email || !consent) {
    return NextResponse.json({ error: 'Lengkapi semua data dan centang persetujuan.' }, { status: 400 })
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 })
  }

  const jobs = await queryRows<{ id: number; title: string; application_url: string | null }>(
    `SELECT id, title, application_url
     FROM job_positions
     WHERE slug=? AND status='published'
       AND (application_deadline IS NULL OR application_deadline >= NOW())
     LIMIT 1`,
    [slug]
  )

  const job = jobs[0]
  if (!job) {
    return NextResponse.json({ error: 'Lowongan tidak ditemukan atau sudah ditutup.' }, { status: 404 })
  }

  const applicationCode = `GS-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`

  const insertResult = await execute(
    `INSERT INTO job_applications (job_position_id, application_code, full_name, province, city, phone, email, status, consent_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())`,
    [job.id, applicationCode, fullName, province, city, phone, email]
  )

  const applicationId = insertResult.insertId

  let targetUrl = ''

  // Buatkan assignment otomatis sehingga kandidat langsung bisa mengerjakan psikotes di web
  try {
    const testSets = await queryRows<{ id: number }>(
      `SELECT id FROM psychotest_sets WHERE status='published' ORDER BY id ASC LIMIT 1`
    )

    if (testSets.length > 0) {
      const testSetId = testSets[0].id
      const rawToken = randomBytes(32).toString('base64url')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 7 * 86400000) // 7 hari

      await execute(
        `INSERT INTO psychotest_assignments (application_id, test_set_id, access_token_hash, status, expires_at)
         VALUES (?, ?, ?, 'invited', ?)`,
        [applicationId, testSetId, tokenHash, expiresAt]
      )

      await execute(
        `UPDATE job_applications SET status='psychotest_invited', updated_at=NOW() WHERE id=?`,
        [applicationId]
      )

      targetUrl = `/karir/psikotes/${rawToken}`
    }
  } catch (err) {
    console.error('Auto psychotest assignment error:', err)
  }

  if (!targetUrl) {
    targetUrl = job.application_url || `/karir`
  }

  return NextResponse.json({
    ok: true,
    applicationCode,
    targetUrl,
  }, { status: 201 })
}
