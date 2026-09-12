import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { cleanChatMessage } from '@/lib/internal/live-chat'
import { execute, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await context.params
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

  const body = await request.json().catch(() => ({}))
  const quickReplyId = /^\d+$/.test(String(body.quickReplyId || '')) ? Number(body.quickReplyId) : null
  let message = cleanChatMessage(body.message)

  try {
    const conversationRows = await queryRows<any>(
      `SELECT c.id, c.status, c.assigned_admin_id, u.name AS assigned_admin_name
       FROM live_chat_conversations c
       LEFT JOIN admin_users u ON u.id = c.assigned_admin_id
       WHERE c.id = ?
       LIMIT 1`,
      [id]
    )
    const conversation = conversationRows[0]
    if (!conversation) return NextResponse.json({ error: 'Percakapan tidak ditemukan.' }, { status: 404 })
    if (conversation.status === 'closed') return NextResponse.json({ error: 'Percakapan sudah ditutup.' }, { status: 409 })
    if (conversation.assigned_admin_id && Number(conversation.assigned_admin_id) !== Number(admin.id)) {
      return NextResponse.json({ error: `Chat sedang ditangani ${conversation.assigned_admin_name || 'admin lain'}. Ambil alih chat terlebih dahulu.` }, { status: 409 })
    }

    if (!message && quickReplyId) {
      const replyRows = await queryRows<any>(
        'SELECT message FROM live_chat_quick_replies WHERE id = ? AND active = 1 LIMIT 1',
        [quickReplyId]
      )
      message = cleanChatMessage(replyRows[0]?.message)
    }
    if (!message) return NextResponse.json({ error: 'Balasan tidak boleh kosong.' }, { status: 400 })

    if (!conversation.assigned_admin_id) {
      const claimResult = await execute(
        `UPDATE live_chat_conversations
         SET assigned_admin_id = ?, status = 'assigned', closed_at = NULL, updated_at = NOW()
         WHERE id = ? AND assigned_admin_id IS NULL AND status <> 'closed'`,
        [admin.id, id]
      )

      if (Number(claimResult.affectedRows || 0) === 0) {
        const ownershipRows = await queryRows<any>(
          `SELECT c.assigned_admin_id, u.name AS assigned_admin_name
           FROM live_chat_conversations c
           LEFT JOIN admin_users u ON u.id = c.assigned_admin_id
           WHERE c.id = ?
           LIMIT 1`,
          [id]
        )
        const ownership = ownershipRows[0]
        if (ownership?.assigned_admin_id && Number(ownership.assigned_admin_id) !== Number(admin.id)) {
          return NextResponse.json({ error: `Chat baru saja diambil ${ownership.assigned_admin_name || 'admin lain'}. Ambil alih chat jika memang diperlukan.` }, { status: 409 })
        }
      }
    }

    const result = await execute(
      `INSERT INTO live_chat_messages
       (conversation_id, sender_type, sender_admin_id, quick_reply_id, message, is_auto_reply)
       VALUES (?, 'admin', ?, ?, ?, 0)`,
      [id, admin.id, quickReplyId, message]
    )
    await execute(
      `UPDATE live_chat_conversations
       SET assigned_admin_id = COALESCE(assigned_admin_id, ?),
           status = CASE WHEN status = 'open' THEN 'assigned' ELSE status END,
           admin_last_read_at = NOW(), last_message_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [admin.id, id]
    )

    return NextResponse.json({
      ok: true,
      message: {
        id: Number(result.insertId),
        sender_type: 'admin',
        sender_admin_name: admin.name,
        message,
        quick_reply_id: quickReplyId,
        is_auto_reply: 0,
        created_at: new Date().toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Internal live chat send error:', error)
    return NextResponse.json({ error: 'Balasan gagal dikirim.' }, { status: 500 })
  }
}
