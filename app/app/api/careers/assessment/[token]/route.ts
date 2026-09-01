import { NextResponse } from 'next/server'
import { isDatabaseConfigured, queryRows } from '@/lib/internal/db'
import { getAssessmentHeader } from '@/lib/career/assessment'

export const runtime = 'nodejs'

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: 'Database psikotes belum dikonfigurasi.' }, { status: 503 })
  const { token } = await context.params
  const header = await getAssessmentHeader(token)
  if (!header) return NextResponse.json({ error: 'Tautan psikotes tidak valid.' }, { status: 404 })
  const sections = await queryRows<any>('SELECT id, title, instructions, duration_minutes, section_order FROM psychotest_sections WHERE test_set_id=? ORDER BY section_order', [header.test_set_id])
  if (header.status === 'invited') return NextResponse.json({ data: { ...header, sections, currentSection: null, answers: {} }, serverNow: new Date().toISOString() })
  if (header.status !== 'in_progress') return NextResponse.json({ data: { ...header, sections, currentSection: null, answers: {} }, serverNow: new Date().toISOString() })
  const current = sections.find(section => Number(section.section_order) === Number(header.current_section_order))
  if (!current) return NextResponse.json({ error: 'Bagian psikotes tidak ditemukan.' }, { status: 409 })
  const questions = await queryRows<any>(`SELECT id, question_text, question_type, scoring_mode, is_required, question_order
    FROM psychotest_questions WHERE section_id=? ORDER BY question_order`, [current.id])
  const ids = questions.map(q => q.id)
  let options: any[] = []
  let answers: any[] = []
  if (ids.length) {
    const placeholders = ids.map(() => '?').join(',')
    options = await queryRows<any>(`SELECT question_id, option_key, option_text, display_order FROM psychotest_question_options WHERE question_id IN (${placeholders}) ORDER BY display_order`, ids)
    answers = await queryRows<any>(`SELECT question_id, answer_json FROM psychotest_answers WHERE assignment_id=? AND question_id IN (${placeholders})`, [header.id, ...ids])
  }
  const answerMap = Object.fromEntries(answers.map(item => { try { return [item.question_id, JSON.parse(item.answer_json)] } catch { return [item.question_id, null] } }))
  const currentSection = { ...current, questions: questions.map(q => ({ ...q, options: options.filter(o => o.question_id === q.id) })) }
  const deadline = header.section_started_at ? new Date(new Date(header.section_started_at).getTime() + Number(current.duration_minutes) * 60000).toISOString() : null
  return NextResponse.json({ data: { ...header, sections, currentSection, answers: answerMap, sectionDeadline: deadline }, serverNow: new Date().toISOString() })
}
