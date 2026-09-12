import { NextRequest, NextResponse } from 'next/server'
import { execute, queryRows } from '@/lib/internal/db'
import { cleanChatMessage, findLiveChatConversationByToken } from '@/lib/internal/live-chat'
import { isNegotiationIntent, sortSuggestedQuickReplies } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NEGOTIATION_HANDOFF_MESSAGE = 'Untuk pertanyaan terkait taksiran harga, nominal pinjaman, atau negosiasi, Admin HO akan menindaklanjuti melalui WhatsApp.\n\nAdmin akan menghubungi terlebih dahulu ke nomor WhatsApp yang Kakak daftarkan pada Live Chat. Agar proses lebih cepat, siapkan informasi jenis barang, merek, tipe/seri, kondisi, kelengkapan, dan cabang/domisili Kakak. Tidak perlu mengirim pertanyaan yang sama berulang kali.'

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
  const requestedQuickReplyId = /^\d+$/.test(String(body.quickReplyId || '')) ? Number(body.quickReplyId) : null

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

    let autoReply: any = null
    let handoffType: 'admin_whatsapp' | null = null

    if (isNegotiationIntent(message)) {
      handoffType = 'admin_whatsapp'
      autoReply = {
        id: null,
        message: NEGOTIATION_HANDOFF_MESSAGE,
      }
    } else if (requestedQuickReplyId) {
      const exactReplies = await queryRows<any>(
        `SELECT id, title, category, message, keywords, priority, auto_send, active, customer_visible
         FROM live_chat_quick_replies
         WHERE id = ? AND active = 1 AND auto_send = 1 AND customer_visible = 1
         LIMIT 1`,
        [requestedQuickReplyId]
      )
      autoReply = exactReplies[0] || null
    } else {
      const replies = await queryRows<any>(
        `SELECT id, title, category, message, keywords, priority, auto_send, active, customer_visible
         FROM live_chat_quick_replies
         WHERE active = 1 AND auto_send = 1
         ORDER BY priority DESC, id ASC`
      )
      autoReply = sortSuggestedQuickReplies(message, replies)[0] || null
    }

    let botMessage: any = null
    if (autoReply) {
      const botResult = await execute(
        `INSERT INTO live_chat_messages
         (conversation_id, sender_type, quick_reply_id, message, is_auto_reply)
         VALUES (?, 'bot', ?, ?, 1)`,
        [conversation.id, autoReply.id || null, autoReply.message]
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

    return NextResponse.json({
      ok: true,
      handoffType,
      autoReplied: Boolean(botMessage),
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
