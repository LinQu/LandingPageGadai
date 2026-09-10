import { createHash, randomBytes } from 'node:crypto'
import { queryRows } from './db'

export const LIVE_CHAT_GREETING = 'Halo 👋 Selamat datang di Gadai Sakti. Pesan Anda sudah terhubung ke Admin HO. Ada yang bisa kami bantu?'

export function createLiveChatToken() {
  return randomBytes(32).toString('base64url')
}

export function hashLiveChatToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function findLiveChatConversationByToken(token: string) {
  if (!token || token.length < 20 || token.length > 200) return null
  const rows = await queryRows<any>(
    `SELECT c.id, c.customer_name, c.customer_phone, c.status, c.assigned_admin_id,
            c.last_message_at, c.created_at, c.closed_at, u.name AS assigned_admin_name
     FROM live_chat_conversations c
     LEFT JOIN admin_users u ON u.id = c.assigned_admin_id
     WHERE c.public_token_hash = ?
     LIMIT 1`,
    [hashLiveChatToken(token)]
  )
  return rows[0] || null
}

export function cleanChatMessage(value: unknown, maxLength = 1200) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, maxLength)
}
