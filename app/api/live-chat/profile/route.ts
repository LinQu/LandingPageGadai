import { NextRequest, NextResponse } from 'next/server'
import { execute } from '@/lib/internal/db'
import { cleanChatMessage, findLiveChatConversationByToken } from '@/lib/internal/live-chat'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseCoordinate(value: unknown, min: number, max: number) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return null
  return parsed
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const token = String(body.token || '')
  const domicile = cleanChatMessage(body.domicile, 255)
  const latitude = parseCoordinate(body.latitude, -90, 90)
  const longitude = parseCoordinate(body.longitude, -180, 180)

  try {
    const conversation = await findLiveChatConversationByToken(token)
    if (!conversation) return NextResponse.json({ error: 'Sesi chat tidak ditemukan.' }, { status: 404 })

    await execute(
      `UPDATE live_chat_conversations
       SET customer_domicile = ?, customer_latitude = ?, customer_longitude = ?, updated_at = NOW()
       WHERE id = ?`,
      [domicile || null, latitude, longitude, conversation.id]
    )

    return NextResponse.json({
      ok: true,
      profile: {
        domicile: domicile || null,
        latitude,
        longitude,
      },
    })
  } catch (error) {
    console.error('Live chat profile PATCH error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan domisili.' }, { status: 500 })
  }
}
