import { NextResponse } from 'next/server'
import { execute, queryRows } from '@/lib/internal/db'
import { getAssessmentHeader } from '@/lib/career/assessment'

export const runtime = 'nodejs'
export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const assignment = await getAssessmentHeader(token)
  if (!assignment || assignment.status !== 'in_progress') return NextResponse.json({ error: 'Sesi psikotes tidak aktif.' }, { status: 409 })
  const rows = await queryRows<{ max_order: number }>('SELECT MAX(section_order) AS max_order FROM psychotest_sections WHERE test_set_id=?', [assignment.test_set_id])
  const maxOrder = Number(rows[0]?.max_order || 1); const current = Number(assignment.current_section_order || 1)
  if (current >= maxOrder) return NextResponse.json({ ok: true, last: true })
  await execute('UPDATE psychotest_assignments SET current_section_order=?, section_started_at=NOW() WHERE id=?', [current + 1, assignment.id])
  return NextResponse.json({ ok: true, last: false, currentSectionOrder: current + 1 })
}
