import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getConversation(id: string) {
  const rows = await queryRows<any>(
    `SELECT c.id, c.customer_name, c.customer_phone, c.status, c.assigned_admin_id,
            c.last_message_at, c.created_at, c.closed_at, c.source_page,
            u.name AS assigned_admin_name
     FROM live_chat_conversations c
     LEFT JOIN admin_users u ON u.id = c.assigned_admin_id
     WHERE c.id = ?
     LIMIT 1`,
    [id]
  )
  return rows[0] || null
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  try {
    const conversation = await getConversation(id)
    if (!conversation) return NextResponse.json({ error: 'Percakapan tidak ditemukan.' }, { status: 404 })

    const messages = await queryRows<any>(
      `SELECT m.id, m.sender_type, m.message, m.is_auto_reply, m.quick_reply_id, m.created_at,
              u.name AS sender_admin_name
       FROM live_chat_messages m
       LEFT JOIN admin_users u ON u.id = m.sender_admin_id
       WHERE m.conversation_id = ?
       ORDER BY m.id ASC
       LIMIT 1000`,
      [id]
    )
    await execute('UPDATE live_chat_conversations SET admin_last_read_at = NOW() WHERE id = ?', [id])

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error('Internal live chat conversation detail error:', error)
    return NextResponse.json({ error: 'Gagal memuat percakapan.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })
  const body = await request.json().catch(() => ({}))
  const action = String(body.action || '')

  try {
    if (action === 'assign') {
      await execute(
        `UPDATE live_chat_conversations
         SET assigned_admin_id = ?, status = 'assigned', closed_at = NULL, updated_at = NOW()
         WHERE id = ?`,
        [admin.id, id]
      )
    } else if (action === 'close') {
      await execute(
        `UPDATE live_chat_conversations
         SET status = 'closed', closed_at = NOW(), updated_at = NOW()
         WHERE id = ?`,
        [id]
      )
    } else if (action === 'reopen') {
      await execute(
        `UPDATE live_chat_conversations
         SET status = 'assigned', assigned_admin_id = ?, closed_at = NULL, updated_at = NOW()
         WHERE id = ?`,
        [admin.id, id]
      )
    } else if (action === 'read') {
      await execute('UPDATE live_chat_conversations SET admin_last_read_at = NOW() WHERE id = ?', [id])
    } else {
      return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 })
    }

    const conversation = await getConversation(id)
    return NextResponse.json({ ok: true, conversation })
  } catch (error) {
    console.error('Internal live chat conversation PATCH error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui percakapan.' }, { status: 500 })
  }
}
