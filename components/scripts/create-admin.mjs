import { randomBytes, scrypt as scryptCallback } from 'node:crypto'
import { promisify } from 'node:util'
import mysql from 'mysql2/promise'

const scrypt = promisify(scryptCallback)

function readArg(name) {
  const prefix = `--${name}=`
  const match = process.argv.find(arg => arg.startsWith(prefix))
  return match ? match.slice(prefix.length) : ''
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scrypt(password, salt, 64)
  return `scrypt$${salt}$${Buffer.from(derived).toString('hex')}`
}

const email = readArg('email').trim().toLowerCase()
const password = readArg('password')
const name = readArg('name').trim() || 'Administrator'
const role = readArg('role') === 'editor' ? 'editor' : 'super_admin'

if (!email || password.length < 10) {
  console.error('Gunakan: npm run internal:create-admin -- --email=admin@example.com --password=Minimal10Karakter --name="Admin" --role=super_admin')
  process.exit(1)
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
})

const passwordHash = await hashPassword(password)
await pool.execute(
  `INSERT INTO admin_users (name, email, password_hash, role, is_active)
   VALUES (?, ?, ?, ?, 1)
   ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role), is_active=1`,
  [name, email, passwordHash, role]
)
await pool.end()
console.log(`Admin ${email} berhasil dibuat/diperbarui dengan role ${role}.`)
