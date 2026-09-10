import { NextRequest, NextResponse } from 'next/server'
import { execute, queryRows } from '@/lib/internal/db'
import { cleanChatMessage, findLiveChatConversationByToken } from '@/lib/internal/live-chat'
import { sortSuggestedQuickReplies } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const token = String(request.headers.get('x-live-chat-token') || '')
  const afterRaw = String(request.nextUrl.searchParams.get('after') || '0')
  const after = /^\d+$/.test(afterRaw) ? Number(afterRaw) : 0

  try {
    const conversation = await findLiveChatConversationByToken(token)
    if (!conversation) return NextResponse.json({ error: 'Sesi chat tidak ditemukan.' }, { status: 404 })

    const messages = await queryRows<any>(
      `SELECT m.id, m.sender_type, m.message, m.is_auto_reply, m.created_at,
              u.name AS sender_admin_name
       FROM live_chat_messages m
       LEFT JOIN admin_users u ON u.id = m.sender_admin_id
       WHERE m.conversation_id = ? AND m.id > ?
       ORDER BY m.id ASC
       LIMIT 250`,
      [conversation.id, after]
    )

    return NextResponse.json({ conversation, messages })
  } catch (error) {
    console.error('Live chat messages GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat pesan.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const token = String(body.token || '')
  const message = cleanChatMessage(body.message)

  if (!message) return NextResponse.json({ error: 'Pesan tidak boleh kosong.' }, { status: 400 })

  try {
    const conversation = await findLiveChatConversationByToken(token)
    if (!conversation) return NextResponse.json({ error: 'Sesi chat tidak ditemukan.' }, { status: 404 })
    if (conversation.status === 'closed') {
      return NextResponse.json({ error: 'Percakapan ini sudah selesai. Mulai chat baru untuk melanjutkan.' }, { status: 409 })
    }

    const recentCountRows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM live_chat_messages
       WHERE conversation_id = ? AND sender_type = 'customer'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 60 SECOND)`,
      [conversation.id]
    )
    if (Number(recentCountRows[0]?.total || 0) >= 12) {
      return NextResponse.json({ error: 'Pesan terlalu cepat. Tunggu sebentar lalu kirim kembali.' }, { status: 429 })
    }

    const result = await execute(
      `INSERT INTO live_chat_messages (conversation_id, sender_type, message, is_auto_reply)
       VALUES (?, 'customer', ?, 0)`,
      [conversation.id, message]
    )
    const customerMessageId = Number(result.insertId)
    await execute(`UPDATE live_chat_conversations SET last_message_at = NOW() WHERE id = ?`, [conversation.id])

    const replies = await queryRows<any>(
      `SELECT id, title, category, message, keywords, priority, auto_send, active
       FROM live_chat_quick_replies
       WHERE active = 1 AND auto_send = 1
       ORDER BY priority DESC, id ASC`
    )
    const suggestions = sortSuggestedQuickReplies(message, replies)
    const autoReply = suggestions[0]
    let botMessage: any = null

    if (autoReply) {
      const usedRows = await queryRows<{ total: number }>(
        `SELECT COUNT(*) AS total
         FROM live_chat_messages
         WHERE conversation_id = ? AND sender_type = 'bot' AND quick_reply_id = ?`,
        [conversation.id, autoReply.id]
      )

      if (Number(usedRows[0]?.total || 0) === 0) {
        const botResult = await execute(
          `INSERT INTO live_chat_messages
           (conversation_id, sender_type, quick_reply_id, message, is_auto_reply)
           VALUES (?, 'bot', ?, ?, 1)`,
          [conversation.id, autoReply.id, autoReply.message]
        )
        botMessage = {
          id: Number(botResult.insertId),
          sender_type: 'bot',
          message: autoReply.message,
          is_auto_reply: 1,
          created_at: new Date().toISOString(),
        }
        await execute(`UPDATE live_chat_conversations SET last_message_at = NOW() WHERE id = ?`, [conversation.id])
      }
    }

    return NextResponse.json({
      ok: true,
      messages: [
        {
          id: customerMessageId,
          sender_type: 'customer',
          message,
          is_auto_reply: 0,
          created_at: new Date().toISOString(),
        },
        ...(botMessage ? [botMessage] : []),
      ],
    }, { status: 201 })
  } catch (error) {
    console.error('Live chat messages POST error:', error)
    return NextResponse.json({ error: 'Pesan gagal dikirim.' }, { status: 500 })
  }
}
