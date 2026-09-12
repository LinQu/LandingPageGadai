import { createHash, randomBytes } from 'node:crypto'
import { queryRows } from './db'

export const LIVE_CHAT_GREETING = 'Halo Kak 👋\nSelamat datang di Live Chat Gadai Sakti.\n\nKami siap membantu informasi barang yang dapat digadai, syarat, proses, pembayaran, pelunasan, lokasi cabang, dan informasi lainnya.\n\nGunakan menu Pertanyaan Cepat untuk jawaban otomatis. Menu tersebut dapat dibuka atau ditutup kapan saja agar area percakapan tetap lega. Kakak juga bisa mengetik pertanyaan secara langsung dan Admin HO akan membantu jika jawaban otomatis belum tersedia.'

export function createLiveChatToken() {
  return randomBytes(32).toString('base64url')
}

export function hashLiveChatToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function findLiveChatConversationByToken(token: string) {
  if (!token || token.length < 20 || token.length > 200) return null
  const rows = await queryRows<any>(
    `SELECT c.id, c.customer_name, c.customer_phone, c.customer_domicile,
            c.customer_latitude, c.customer_longitude, c.status, c.assigned_admin_id,
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
