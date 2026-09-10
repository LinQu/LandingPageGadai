import { NextResponse } from 'next/server'
import { isDatabaseConfigured, queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ online: false, status: 'offline' })

  try {
    const rows = await queryRows<{ status: 'online' | 'busy'; total: number }>(
      `SELECT status, COUNT(*) AS total
       FROM live_chat_agent_presence
       WHERE status IN ('online','busy')
         AND last_seen_at >= DATE_SUB(NOW(), INTERVAL 90 SECOND)
       GROUP BY status
       ORDER BY FIELD(status, 'online', 'busy')
       LIMIT 1`
    )
    const row = rows[0]
    return NextResponse.json({
      online: Boolean(row && Number(row.total) > 0),
      status: row?.status || 'offline',
    })
  } catch {
    return NextResponse.json({ online: false, status: 'offline' })
  }
}
