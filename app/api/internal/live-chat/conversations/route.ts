import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { queryRows } from '@/lib/internal/db'
import { isNegotiationIntent } from '@/lib/live-chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = String(request.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
  const rawStatus = String(request.nextUrl.searchParams.get('status') || 'active')
  const status = ['open', 'assigned', 'closed', 'all', 'active'].includes(rawStatus) ? rawStatus : 'active'
  const mineOnly = request.nextUrl.searchParams.get('mine') === '1'

  const where: string[] = []
  const params: unknown[] = []

  if (status === 'active') where.push(`c.status IN ('open','assigned')`)
  else if (status !== 'all') {
    where.push('c.status = ?')
    params.push(status)
  }

  if (mineOnly) {
    where.push('c.assigned_admin_id = ?')
    params.push(admin.id)
  }

  if (q) {
    where.push('(c.customer_name LIKE ? OR c.customer_phone LIKE ? OR c.customer_domicile LIKE ?)')
    params.push(`%${q}%`, `%${q}%`, `%${q}%`)
  }

  try {
    const rows = await queryRows<any>(
      `SELECT c.id, c.customer_name, c.customer_phone, c.customer_domicile,
              c.customer_latitude, c.customer_longitude, c.status, c.assigned_admin_id,
              c.last_message_at, c.created_at, c.closed_at, c.source_page,
              u.name AS assigned_admin_name,
              (SELECT m.message FROM live_chat_messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
              (SELECT m.sender_type FROM live_chat_messages m WHERE m.conversation_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_sender_type,
              (SELECT m.message FROM live_chat_messages m WHERE m.conversation_id = c.id AND m.sender_type = 'customer' ORDER BY m.id DESC LIMIT 1) AS last_customer_message,
              CASE
                WHEN c.status <> 'closed'
                 AND EXISTS (
                   SELECT 1
                   FROM live_chat_messages pending
                   WHERE pending.conversation_id = c.id
                     AND pending.sender_type = 'customer'
                     AND pending.id > COALESCE((
                       SELECT MAX(answered.id)
                       FROM live_chat_messages answered
                       WHERE answered.conversation_id = c.id
                         AND answered.sender_type IN ('admin','bot')
                     ), 0)
                     AND pending.created_at <= DATE_SUB(NOW(), INTERVAL 3 MINUTE)
                 )
                THEN 1 ELSE 0
              END AS sla_overdue,
              (SELECT COUNT(*) FROM live_chat_messages m
               WHERE m.conversation_id = c.id
                 AND m.sender_type = 'customer'
                 AND (c.admin_last_read_at IS NULL OR m.created_at > c.admin_last_read_at)) AS unread_count
       FROM live_chat_conversations c
       LEFT JOIN admin_users u ON u.id = c.assigned_admin_id
       ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
       ORDER BY sla_overdue DESC, (c.status = 'closed') ASC, c.last_message_at DESC
       LIMIT 250`,
      params
    )

    const data = rows.map((row) => ({
      ...row,
      needs_whatsapp: isNegotiationIntent(row.last_customer_message) ? 1 : 0,
    })).sort((a, b) => {
      const slaDiff = Number(b.sla_overdue || 0) - Number(a.sla_overdue || 0)
      if (slaDiff !== 0) return slaDiff
      return Number(b.needs_whatsapp || 0) - Number(a.needs_whatsapp || 0)
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Internal live chat conversation list error:', error)
    return NextResponse.json({ error: 'Gagal memuat daftar live chat.' }, { status: 500 })
  }
}
