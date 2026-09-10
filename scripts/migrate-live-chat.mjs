import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx <= 0) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env.production'))
loadEnvFile(path.join(process.cwd(), '.env'))

const required = ['DB_HOST', 'DB_USER', 'DB_NAME']
const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Environment database belum lengkap: ${missing.join(', ')}`)
  process.exit(1)
}

const migrationPath = path.join(process.cwd(), 'database', 'migrations', '005-live-chat.sql')
const sql = fs.readFileSync(migrationPath, 'utf8')
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  multipleStatements: true,
  charset: 'utf8mb4',
})

const liveChatTables = [
  'live_chat_conversations',
  'live_chat_quick_replies',
  'live_chat_messages',
  'live_chat_agent_presence',
]

async function ensureUtf8mb4() {
  for (const table of liveChatTables) {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS bad_columns
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = ?
         AND CHARACTER_SET_NAME IS NOT NULL
         AND CHARACTER_SET_NAME <> 'utf8mb4'`,
      [process.env.DB_NAME, table]
    )

    if (Number(rows[0]?.bad_columns || 0) > 0) {
      console.log(`Converting ${table} to utf8mb4...`)
      await db.query(
        `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      )
    }
  }
}

try {
  await db.query(sql)
  await ensureUtf8mb4()
  console.log('Migrasi Live Chat Gadai Sakti selesai.')
  console.log('Charset Live Chat: utf8mb4')
  console.log('Tabel: live_chat_conversations, live_chat_messages, live_chat_quick_replies, live_chat_agent_presence')
} finally {
  await db.end()
}
