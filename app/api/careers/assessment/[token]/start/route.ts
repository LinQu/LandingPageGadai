import { NextResponse } from 'next/server'
import { execute } from '@/lib/internal/db'
import { getAssessmentHeader } from '@/lib/career/assessment'

export const runtime = 'nodejs'
export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const assignment = await getAssessmentHeader(token)
  if (!assignment) return NextResponse.json({ error: 'Tautan psikotes tidak valid.' }, { status: 404 })
  if (assignment.status === 'expired') return NextResponse.json({ error: 'Tautan psikotes sudah kedaluwarsa.' }, { status: 410 })
  if (assignment.status === 'cancelled') return NextResponse.json({ error: 'Undangan psikotes sudah dibatalkan.' }, { status: 410 })
  if (assignment.status === 'submitted') return NextResponse.json({ ok: true, status: 'submitted' })
  if (assignment.status === 'invited') await execute(`UPDATE psychotest_assignments SET status='in_progress', started_at=NOW(), current_section_order=1, section_started_at=NOW() WHERE id=?`, [assignment.id])
  return NextResponse.json({ ok: true })
}
