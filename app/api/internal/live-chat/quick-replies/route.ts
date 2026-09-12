import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'
import { splitKeywords } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rows = await queryRows<any>(
      `SELECT id, title, category, message, keywords, priority, auto_send, active, customer_visible, created_at, updated_at
       FROM live_chat_quick_replies
       ORDER BY active DESC, priority DESC, title ASC`
    )
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Internal quick reply GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat balas cepat.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim().slice(0, 160)
  const category = String(body.category || 'Umum').trim().slice(0, 100)
  const message = String(body.message || '').trim().slice(0, 2000)
  const keywords = splitKeywords(body.keywords).join(', ')
  const priority = Math.max(0, Math.min(999, Number(body.priority || 0)))
  const autoSend = body.autoSend ? 1 : 0
  const active = body.active === false ? 0 : 1
  const customerVisible = body.customerVisible ? 1 : 0

  if (!title || !message) return NextResponse.json({ error: 'Judul dan isi balasan wajib diisi.' }, { status: 400 })
  if ((autoSend || keywords) && splitKeywords(keywords).length === 0) {
    return NextResponse.json({ error: 'Keyword wajib diisi untuk auto reply.' }, { status: 400 })
  }

  try {
    const result = await execute(
      `INSERT INTO live_chat_quick_replies
       (title, category, message, keywords, priority, auto_send, active, customer_visible, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, message, keywords, priority, autoSend, active, customerVisible, admin.id]
    )
    return NextResponse.json({ ok: true, id: Number(result.insertId) }, { status: 201 })
  } catch (error) {
    console.error('Internal quick reply POST error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan balas cepat.' }, { status: 500 })
  }
}
