import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { execute } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const status = ['online', 'busy', 'offline'].includes(String(body.status)) ? String(body.status) : 'online'

  try {
    await execute(
      `INSERT INTO live_chat_agent_presence (admin_user_id, status, last_seen_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status), last_seen_at = NOW(), updated_at = NOW()`,
      [admin.id, status]
    )
    return NextResponse.json({ ok: true, status })
  } catch (error) {
    console.error('Internal live chat presence error:', error)
    return NextResponse.json({ error: 'Gagal memperbarui status admin.' }, { status: 500 })
  }
}
