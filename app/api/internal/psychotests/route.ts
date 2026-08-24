import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function GET() {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const rows = await queryRows<any>(`SELECT ps.id, ps.name, ps.description, ps.instructions, ps.status, ps.created_at, ps.updated_at,
    COUNT(DISTINCT s.id) AS section_count, COUNT(DISTINCT q.id) AS question_count
    FROM psychotest_sets ps
    LEFT JOIN psychotest_sections s ON s.test_set_id=ps.id
    LEFT JOIN psychotest_questions q ON q.section_id=s.id
    GROUP BY ps.id ORDER BY ps.created_at DESC`)
  return NextResponse.json({ data: rows })
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const name = String(body.name || '').trim(); const description = String(body.description || '').trim(); const instructions = String(body.instructions || '').trim()
  const status = 'draft' // Paket baru selalu draft; publish setelah struktur soal lengkap.
  if (!name || !description || !instructions) return NextResponse.json({ error: 'Nama, deskripsi, dan instruksi wajib diisi.' }, { status: 400 })
  const result = await execute('INSERT INTO psychotest_sets (name, description, instructions, status, created_by) VALUES (?, ?, ?, ?, ?)', [name, description, instructions, status, admin.id])
  return NextResponse.json({ ok: true, id: result.insertId }, { status: 201 })
}
