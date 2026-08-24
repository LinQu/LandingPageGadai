import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'node:crypto'
import { execute, isDatabaseConfigured, queryRows } from './db'
import { verifyPassword } from './password'

export const INTERNAL_SESSION_COOKIE = 'gs_internal_session'

type AdminRow = {
  id: number
  name: string
  email: string
  password_hash: string
  role: 'super_admin' | 'editor'
  is_active: number
}

export type CurrentAdmin = Pick<AdminRow, 'id' | 'name' | 'email' | 'role'>

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function authenticateAdmin(email: string, password: string) {
  if (!isDatabaseConfigured()) return null

  const admins = await queryRows<AdminRow>(
    `SELECT id, name, email, password_hash, role, is_active
     FROM admin_users
     WHERE email = ?
     LIMIT 1`,
    [email.trim().toLowerCase()]
  )
  const admin = admins[0]
  if (!admin || !admin.is_active) return null

  const valid = await verifyPassword(password, admin.password_hash)
  if (!valid) return null

  await execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [admin.id])
  return admin
}

export async function createAdminSession(adminId: number) {
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = hashSessionToken(rawToken)
  const days = Math.max(1, Number(process.env.INTERNAL_SESSION_DAYS || 1))
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  await execute(
    `INSERT INTO admin_sessions (admin_user_id, token_hash, expires_at)
     VALUES (?, ?, ?)`,
    [adminId, tokenHash, expiresAt]
  )

  const cookieStore = await cookies()
  cookieStore.set(INTERNAL_SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    expires: expiresAt,
  })
}

export async function destroyAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(INTERNAL_SESSION_COOKIE)?.value

  if (token && isDatabaseConfigured()) {
    await execute('DELETE FROM admin_sessions WHERE token_hash = ?', [hashSessionToken(token)])
  }

  cookieStore.delete(INTERNAL_SESSION_COOKIE)
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  if (!isDatabaseConfigured()) return null

  const cookieStore = await cookies()
  const token = cookieStore.get(INTERNAL_SESSION_COOKIE)?.value
  if (!token) return null

  const rows = await queryRows<CurrentAdmin>(
    `SELECT u.id, u.name, u.email, u.role
     FROM admin_sessions s
     INNER JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.token_hash = ?
       AND s.expires_at > NOW()
       AND u.is_active = 1
     LIMIT 1`,
    [hashSessionToken(token)]
  )

  return rows[0] || null
}
