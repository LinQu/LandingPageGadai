import { NextResponse } from 'next/server'
import { execute, queryRows } from '@/lib/internal/db'
import { getAssessmentHeader } from '@/lib/career/assessment'

function sameAnswer(answer: any, key: any) {
  if (Array.isArray(key)) {
    const a = Array.isArray(answer) ? answer.map(String).sort() : []
    const b = key.map(String).sort()
    return a.length === b.length && a.every((value, index) => value === b[index])
  }
  return String(answer ?? '').trim().toLowerCase() === String(key ?? '').trim().toLowerCase()
}

export const runtime = 'nodejs'
export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params; const assignment = await getAssessmentHeader(token)
  if (!assignment) return NextResponse.json({ error: 'Tautan psikotes tidak valid.' }, { status: 404 })
  if (assignment.status === 'submitted') return NextResponse.json({ ok: true })
  if (assignment.status !== 'in_progress') return NextResponse.json({ error: 'Sesi psikotes tidak aktif.' }, { status: 409 })
  const maxRows = await queryRows<{ max_order: number }>('SELECT MAX(section_order) AS max_order FROM psychotest_sections WHERE test_set_id=?', [assignment.test_set_id])
  if (Number(assignment.current_section_order) < Number(maxRows[0]?.max_order || 1)) return NextResponse.json({ error: 'Selesaikan semua bagian sebelum mengirim psikotes.' }, { status: 409 })

  const rows = await queryRows<any>(`SELECT q.id, q.scoring_mode, q.answer_key_json, q.weight, a.answer_json
    FROM psychotest_questions q
    INNER JOIN psychotest_sections s ON s.id=q.section_id
    LEFT JOIN psychotest_answers a ON a.assignment_id=? AND a.question_id=q.id
    WHERE s.test_set_id=? ORDER BY s.section_order, q.question_order`, [assignment.id, assignment.test_set_id])
  let raw = 0; let max = 0
  for (const row of rows) {
    if (row.scoring_mode !== 'objective' || !row.answer_key_json) continue
    const weight = Number(row.weight || 1); max += weight
    let key: any = null; let answer: any = null
    try { key = JSON.parse(row.answer_key_json) } catch {}
    try { answer = row.answer_json ? JSON.parse(row.answer_json) : null } catch {}
    const correct = sameAnswer(answer, key); const score = correct ? weight : 0; raw += score
    if (row.answer_json) await execute('UPDATE psychotest_answers SET is_correct=?, score_value=? WHERE assignment_id=? AND question_id=?', [correct ? 1 : 0, score, assignment.id, row.id])
  }
  await execute(`UPDATE psychotest_assignments SET status='submitted', submitted_at=NOW(), raw_score=?, max_score=? WHERE id=?`, [raw, max, assignment.id])
  await execute(`UPDATE job_applications SET status='psychotest_completed', updated_at=NOW() WHERE id=?`, [assignment.application_id])
  return NextResponse.json({ ok: true })
}
