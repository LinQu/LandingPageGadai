import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password: string) {
  if (password.length < 10) {
    throw new Error('Password minimal 10 karakter.')
  }

  const salt = randomBytes(16).toString('hex')
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hashHex] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !hashHex) return false

  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  const stored = Buffer.from(hashHex, 'hex')
  if (derived.length !== stored.length) return false
  return timingSafeEqual(derived, stored)
}
