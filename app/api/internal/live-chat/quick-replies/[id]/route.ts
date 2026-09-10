import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute } from '@/lib/internal/db'
import { splitKeywords } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const title = String(body.title || '').trim().slice(0, 160)
  const category = String(body.category || 'Umum').trim().slice(0, 100)
  const message = String(body.message || '').trim().slice(0, 2000)
  const keywords = splitKeywords(body.keywords).join(', ')
  const priority = Math.max(0, Math.min(999, Number(body.priority || 0)))
  const autoSend = body.autoSend ? 1 : 0
  const active = body.active === false ? 0 : 1

  if (!title || !message) return NextResponse.json({ error: 'Judul dan isi balasan wajib diisi.' }, { status: 400 })
  if (autoSend && splitKeywords(keywords).length === 0) {
    return NextResponse.json({ error: 'Keyword wajib diisi untuk auto reply.' }, { status: 400 })
  }

  try {
    await execute(
      `UPDATE live_chat_quick_replies
       SET title = ?, category = ?, message = ?, keywords = ?, priority = ?, auto_send = ?, active = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, category, message, keywords, priority, autoSend, active, id]
    )
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Internal quick reply PATCH error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui balas cepat.' }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (admin.role !== 'super_admin') return NextResponse.json({ error: 'Hanya super admin yang dapat menghapus balas cepat.' }, { status: 403 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  try {
    await execute('DELETE FROM live_chat_quick_replies WHERE id = ?', [id])
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Internal quick reply DELETE error:', error)
    return NextResponse.json({ error: 'Balas cepat sedang dipakai dan tidak dapat dihapus. Nonaktifkan saja.' }, { status: 409 })
  }
}
