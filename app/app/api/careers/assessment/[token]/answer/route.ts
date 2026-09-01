import { NextRequest, NextResponse } from 'next/server'
import { execute, queryRows } from '@/lib/internal/db'
import { getAssessmentHeader } from '@/lib/career/assessment'

export const runtime = 'nodejs'
export async function PUT(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const assignment = await getAssessmentHeader(token)
  if (!assignment || assignment.status !== 'in_progress') return NextResponse.json({ error: 'Sesi psikotes tidak aktif.' }, { status: 409 })
  const body = await request.json().catch(() => ({})); const questionId = Number(body.questionId)
  if (!Number.isInteger(questionId)) return NextResponse.json({ error: 'Pertanyaan tidak valid.' }, { status: 400 })
  const rows = await queryRows<any>(`SELECT q.id, s.duration_minutes,
      TIMESTAMPADD(MINUTE, s.duration_minutes, pa.section_started_at) AS section_deadline
    FROM psychotest_assignments pa
    INNER JOIN psychotest_sections s ON s.test_set_id=pa.test_set_id AND s.section_order=pa.current_section_order
    INNER JOIN psychotest_questions q ON q.section_id=s.id
    WHERE pa.id=? AND q.id=? LIMIT 1`, [assignment.id, questionId])
  if (!rows[0]) return NextResponse.json({ error: 'Pertanyaan bukan bagian aktif.' }, { status: 403 })
  if (new Date(rows[0].section_deadline).getTime() < Date.now()) return NextResponse.json({ error: 'Waktu bagian ini sudah habis.', code: 'SECTION_EXPIRED' }, { status: 409 })
  await execute(`INSERT INTO psychotest_answers (assignment_id, question_id, answer_json) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE answer_json=VALUES(answer_json), is_correct=NULL, score_value=NULL, saved_at=NOW()`, [assignment.id, questionId, JSON.stringify(body.answer ?? null)])
  return NextResponse.json({ ok: true })
}
