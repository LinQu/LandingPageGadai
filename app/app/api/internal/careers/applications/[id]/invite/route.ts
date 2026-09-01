import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'node:crypto'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const body = await request.json().catch(() => ({})); const testSetId = Number(body.testSetId); const expiresDays = Math.min(14, Math.max(1, Number(body.expiresDays || 3)))
  if (!Number.isInteger(testSetId)) return NextResponse.json({ error: 'Pilih paket psikotes.' }, { status: 400 })
  const sets = await queryRows<{ id: number }>('SELECT id FROM psychotest_sets WHERE id=? AND status=\'published\' LIMIT 1', [testSetId])
  if (!sets[0]) return NextResponse.json({ error: 'Paket psikotes belum dipublish atau tidak ditemukan.' }, { status: 404 })
  const apps = await queryRows<{ id: number }>('SELECT id FROM job_applications WHERE id=? LIMIT 1', [id]); if (!apps[0]) return NextResponse.json({ error: 'Pelamar tidak ditemukan.' }, { status: 404 })
  const rawToken = randomBytes(32).toString('base64url'); const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + expiresDays * 86400000)
  await execute('UPDATE psychotest_assignments SET status=\'cancelled\' WHERE application_id=? AND status IN (\'invited\',\'in_progress\')', [id])
  await execute(`INSERT INTO psychotest_assignments (application_id, test_set_id, access_token_hash, status, expires_at, created_by) VALUES (?, ?, ?, 'invited', ?, ?)`, [id, testSetId, tokenHash, expiresAt, admin.id])
  await execute(`UPDATE job_applications SET status='psychotest_invited', updated_at=NOW() WHERE id=?`, [id])
  return NextResponse.json({ ok: true, assessmentPath: `/karir/psikotes/${rawToken}`, expiresAt })
}
