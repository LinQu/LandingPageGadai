import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'
export async function GET() {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await queryRows<any>(`SELECT a.*, j.title AS job_title, j.slug AS job_slug,
    pa.id AS assignment_id, pa.status AS assessment_status, pa.expires_at AS assessment_expires_at, pa.raw_score, pa.max_score, ps.name AS assessment_name
    FROM job_applications a
    INNER JOIN job_positions j ON j.id=a.job_position_id
    LEFT JOIN psychotest_assignments pa ON pa.id=(SELECT pa2.id FROM psychotest_assignments pa2 WHERE pa2.application_id=a.id ORDER BY pa2.created_at DESC LIMIT 1)
    LEFT JOIN psychotest_sets ps ON ps.id=pa.test_set_id
    ORDER BY a.created_at DESC`)
  return NextResponse.json({ data: rows })
}
