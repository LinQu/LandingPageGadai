import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { execute, isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Database karir belum dikonfigurasi.' }, { status: 503 })
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
    return NextResponse.json({ error: 'Lengkapi semua data diri dan centang persetujuan.' }, { status: 400 })
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 })
  }

  const jobs = await queryRows<{ id: number; application_url: string | null }>(`
    SELECT id, application_url
    FROM job_positions
    WHERE slug=? AND status='published'
      AND (application_deadline IS NULL OR application_deadline >= NOW())
    LIMIT 1
  `, [slug])

  if (!jobs[0]) {
    return NextResponse.json({ error: 'Lowongan tidak ditemukan atau sudah ditutup.' }, { status: 404 })
  }

  const jobId = jobs[0].id
  const applicationCode = `GS-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`

  // Insert application
  const insertRes = await execute(`
    INSERT INTO job_applications (job_position_id, application_code, full_name, province, city, phone, email, status, consent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
  `, [jobId, applicationCode, fullName, province, city, phone, email])

  const appId = (insertRes as any)?.insertId

  let targetUrl = jobs[0].application_url?.trim() || ''

  // If no external application_url is provided, check if there's a published psychotest set
  if (!targetUrl) {
    const publishedSets = await queryRows<{ id: number }>(`
      SELECT id FROM psychotest_sets WHERE status='published' ORDER BY id ASC LIMIT 1
    `)
    if (publishedSets[0] && appId) {
      const testSetId = publishedSets[0].id
      const rawToken = randomBytes(32).toString('base64url')
      const tokenHash = createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + 3 * 86400000)

      await execute(`
        INSERT INTO psychotest_assignments (application_id, test_set_id, access_token_hash, status, expires_at)
        VALUES (?, ?, ?, 'invited', ?)
      `, [appId, testSetId, tokenHash, expiresAt])

      await execute(`
        UPDATE job_applications SET status='psychotest_invited', updated_at=NOW() WHERE id=?
      `, [appId])

      targetUrl = `/karir/psikotes/${rawToken}`
    } else {
      targetUrl = '/karir'
    }
  }

  return NextResponse.json({
    ok: true,
    applicationCode,
    targetUrl,
    message: 'Biodata berhasil disimpan. Mengarahkan ke web karir / pengerjaan psikotes...',
  }, { status: 201 })
}
