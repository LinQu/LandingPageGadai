import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute } from '@/lib/internal/db'

const allowed = new Set(['submitted','hr_review','psychotest_invited','psychotest_completed','interview_hr','interview_user','document_check','offering','hired','rejected','withdrawn'])
export const runtime = 'nodejs'
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await context.params; if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const body = await request.json().catch(() => ({})); const status = String(body.status || '')
  if (!allowed.has(status)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
  await execute('UPDATE job_applications SET status=?, internal_notes=?, updated_at=NOW() WHERE id=?', [status, String(body.internalNotes || '').trim() || null, id])
  return NextResponse.json({ ok: true })
}
