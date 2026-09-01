import { createHash } from 'node:crypto'
import { execute, queryRows } from '@/lib/internal/db'

export function hashAssessmentToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function getAssessmentHeader(token: string) {
  const rows = await queryRows<any>(`SELECT pa.id, pa.application_id, pa.test_set_id, pa.status, pa.expires_at, pa.started_at, pa.submitted_at,
      pa.current_section_order, pa.section_started_at, pa.raw_score, pa.max_score,
      a.full_name, a.application_code, a.status AS application_status, j.title AS job_title,
      ps.name AS test_name, ps.description AS test_description, ps.instructions AS test_instructions
    FROM psychotest_assignments pa
    INNER JOIN job_applications a ON a.id=pa.application_id
    INNER JOIN job_positions j ON j.id=a.job_position_id
    INNER JOIN psychotest_sets ps ON ps.id=pa.test_set_id
    WHERE pa.access_token_hash=? LIMIT 1`, [hashAssessmentToken(token)])
  const row = rows[0]
  if (!row) return null
  if (!['submitted','cancelled','expired'].includes(row.status) && new Date(row.expires_at).getTime() < Date.now()) {
    await execute(`UPDATE psychotest_assignments SET status='expired' WHERE id=?`, [row.id])
    row.status = 'expired'
  }
  return row
}
