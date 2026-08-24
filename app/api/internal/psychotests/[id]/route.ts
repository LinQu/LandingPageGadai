import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { getDb, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const sets = await queryRows<any>('SELECT id, name, description, instructions, status FROM psychotest_sets WHERE id=? LIMIT 1', [id])
  if (!sets[0]) return NextResponse.json({ error: 'Paket psikotes tidak ditemukan.' }, { status: 404 })
  const sections = await queryRows<any>('SELECT id, title, instructions, duration_minutes, section_order FROM psychotest_sections WHERE test_set_id=? ORDER BY section_order', [id])
  const questions = sections.length ? await queryRows<any>(`SELECT q.id, q.section_id, q.question_text, q.question_type, q.scoring_mode, q.answer_key_json, q.weight, q.is_required, q.question_order
    FROM psychotest_questions q INNER JOIN psychotest_sections s ON s.id=q.section_id WHERE s.test_set_id=? ORDER BY s.section_order, q.question_order`, [id]) : []
  const questionIds = questions.map(q => q.id)
  let options: any[] = []
  if (questionIds.length) {
    const placeholders = questionIds.map(() => '?').join(',')
    options = await queryRows<any>(`SELECT id, question_id, option_key, option_text, display_order FROM psychotest_question_options WHERE question_id IN (${placeholders}) ORDER BY display_order`, questionIds)
  }
  const nested = sections.map(section => ({ ...section, questions: questions.filter(q => q.section_id === section.id).map(q => ({ ...q, answer_key: q.answer_key_json ? JSON.parse(q.answer_key_json) : null, options: options.filter(o => o.question_id === q.id) })) }))
  return NextResponse.json({ data: { ...sets[0], sections: nested } })
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const body = await request.json().catch(() => ({}))
  const name = String(body.name || '').trim(); const description = String(body.description || '').trim(); const instructions = String(body.instructions || '').trim()
  const status = ['published','archived'].includes(body.status) ? body.status : 'draft'; const sections = Array.isArray(body.sections) ? body.sections : []
  if (!name || !description || !instructions) return NextResponse.json({ error: 'Metadata paket psikotes belum lengkap.' }, { status: 400 })
  if (status === 'published' && !sections.length) return NextResponse.json({ error: 'Paket published minimal memiliki satu bagian.' }, { status: 400 })

  const db = await getDb(); const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('UPDATE psychotest_sets SET name=?, description=?, instructions=?, status=?, updated_at=NOW() WHERE id=?', [name, description, instructions, status, id])
    await connection.execute('DELETE FROM psychotest_sections WHERE test_set_id=?', [id])
    for (let sIndex = 0; sIndex < sections.length; sIndex++) {
      const section = sections[sIndex]
      const title = String(section.title || '').trim(); const sectionInstructions = String(section.instructions || '').trim(); const duration = Math.max(1, Math.min(180, Number(section.durationMinutes || 10)))
      if (!title) throw new Error(`Bagian ${sIndex + 1} belum memiliki judul.`)
      const [sectionResult]: any = await connection.execute('INSERT INTO psychotest_sections (test_set_id, title, instructions, duration_minutes, section_order) VALUES (?, ?, ?, ?, ?)', [id, title, sectionInstructions, duration, sIndex + 1])
      const questions = Array.isArray(section.questions) ? section.questions : []
      for (let qIndex = 0; qIndex < questions.length; qIndex++) {
        const question = questions[qIndex]; const text = String(question.questionText || '').trim(); if (!text) throw new Error(`Pertanyaan ${qIndex + 1} pada bagian ${sIndex + 1} kosong.`)
        const type = ['single_choice','multiple_choice','short_text','scale_1_5'].includes(question.questionType) ? question.questionType : 'single_choice'
        const scoringMode = ['single_choice','multiple_choice'].includes(type) && question.scoringMode === 'objective' ? 'objective' : 'none'
        const answerKey = scoringMode === 'objective' ? question.answerKey : null; const weight = Math.max(0, Number(question.weight || 1))
        const [questionResult]: any = await connection.execute(`INSERT INTO psychotest_questions (section_id, question_text, question_type, scoring_mode, answer_key_json, weight, is_required, question_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [sectionResult.insertId, text, type, scoringMode, answerKey == null ? null : JSON.stringify(answerKey), weight, question.isRequired === false ? 0 : 1, qIndex + 1])
        if (['single_choice','multiple_choice'].includes(type)) {
          const options = Array.isArray(question.options) ? question.options : []
          if (options.length < 2) throw new Error(`Pertanyaan pilihan pada bagian ${sIndex + 1} minimal memiliki 2 opsi.`)
          for (let oIndex = 0; oIndex < options.length; oIndex++) {
            const key = String(options[oIndex].key || String.fromCharCode(65 + oIndex)).trim(); const optionText = String(options[oIndex].text || '').trim()
            if (!optionText) throw new Error('Teks opsi jawaban tidak boleh kosong.')
            await connection.execute('INSERT INTO psychotest_question_options (question_id, option_key, option_text, display_order) VALUES (?, ?, ?, ?)', [questionResult.insertId, key, optionText, oIndex + 1])
          }
        }
      }
    }
    await connection.commit()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    await connection.rollback(); console.error(error); return NextResponse.json({ error: error?.message || 'Gagal menyimpan struktur psikotes.' }, { status: 400 })
  } finally { connection.release() }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Hanya super admin yang dapat menghapus paket psikotes.' }, { status: 403 })
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const db = await getDb(); try { await db.execute('DELETE FROM psychotest_sets WHERE id=?', [id]); return NextResponse.json({ ok: true }) }
  catch (error: any) { if (error?.code === 'ER_ROW_IS_REFERENCED_2') return NextResponse.json({ error: 'Paket sudah pernah diassign ke kandidat. Ubah status menjadi archived.' }, { status: 409 }); throw error }
}
