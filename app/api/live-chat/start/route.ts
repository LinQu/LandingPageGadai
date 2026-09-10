import { NextRequest, NextResponse } from 'next/server'
import { getDb, isDatabaseConfigured, queryRows } from '@/lib/internal/db'
import { createLiveChatToken, hashLiveChatToken, LIVE_CHAT_GREETING } from '@/lib/internal/live-chat'
import { isValidCustomerPhone, normalizeCustomerPhone } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Layanan live chat sedang tidak tersedia.' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const name = String(body.name || '').trim().replace(/\s+/g, ' ').slice(0, 120)
  const phone = normalizeCustomerPhone(body.phone)
  const sourcePage = String(body.sourcePage || '').trim().slice(0, 500) || null

  if (name.length < 2) {
    return NextResponse.json({ error: 'Nama minimal 2 karakter.' }, { status: 400 })
  }
  if (!isValidCustomerPhone(phone)) {
    return NextResponse.json({ error: 'Nomor HP/WhatsApp belum valid.' }, { status: 400 })
  }

  try {
    const recentRows = await queryRows<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM live_chat_conversations
       WHERE customer_phone = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
      [phone]
    )
    if (Number(recentRows[0]?.total || 0) >= 3) {
      return NextResponse.json({ error: 'Terlalu banyak sesi chat baru. Gunakan sesi yang sudah ada atau tunggu beberapa menit.' }, { status: 429 })
    }
  } catch (error) {
    console.error('Live chat start rate limit error:', error)
    return NextResponse.json({ error: 'Layanan live chat belum siap. Pastikan migrasi database sudah dijalankan.' }, { status: 503 })
  }

  const rawToken = createLiveChatToken()
  const tokenHash = hashLiveChatToken(rawToken)
  const db = await getDb()
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()
    const [result] = await connection.execute(
      `INSERT INTO live_chat_conversations
       (public_token_hash, customer_name, customer_phone, status, source_page, last_message_at)
       VALUES (?, ?, ?, 'open', ?, NOW())`,
      [tokenHash, name, phone, sourcePage]
    ) as any

    const conversationId = Number(result.insertId)
    const [messageResult] = await connection.execute(
      `INSERT INTO live_chat_messages
       (conversation_id, sender_type, message, is_auto_reply)
       VALUES (?, 'bot', ?, 1)`,
      [conversationId, LIVE_CHAT_GREETING]
    ) as any

    await connection.commit()

    return NextResponse.json({
      ok: true,
      token: rawToken,
      conversation: {
        id: conversationId,
        customer_name: name,
        customer_phone: phone,
        status: 'open',
        assigned_admin_name: null,
      },
      messages: [
        {
          id: Number(messageResult.insertId),
          sender_type: 'bot',
          message: LIVE_CHAT_GREETING,
          is_auto_reply: 1,
          created_at: new Date().toISOString(),
        },
      ],
    }, { status: 201 })
  } catch (error) {
    await connection.rollback()
    console.error('Live chat start error:', error)
    return NextResponse.json({ error: 'Gagal memulai live chat. Silakan coba lagi.' }, { status: 500 })
  } finally {
    connection.release()
  }
}
