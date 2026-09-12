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
const faqMigrationPath = path.join(process.cwd(), 'database', 'migrations', '006-live-chat-faq.sql')
const faqSql = fs.existsSync(faqMigrationPath) ? fs.readFileSync(faqMigrationPath, 'utf8') : ''
const enhancementMigrationPath = path.join(process.cwd(), 'database', 'migrations', '007-live-chat-enhancements.sql')
const enhancementSql = fs.existsSync(enhancementMigrationPath) ? fs.readFileSync(enhancementMigrationPath, 'utf8') : ''
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


async function ensureLiveChatFaqColumns() {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'live_chat_quick_replies'
       AND COLUMN_NAME = 'customer_visible'`,
    [process.env.DB_NAME]
  )

  if (rows.length === 0) {
    console.log('Adding customer_visible to live_chat_quick_replies...')
    await db.query(
      `ALTER TABLE live_chat_quick_replies
       ADD COLUMN customer_visible TINYINT(1) NOT NULL DEFAULT 0 AFTER active`
    )
  }
}

async function ensureLiveChatEnhancementColumns() {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ?
       AND TABLE_NAME = 'live_chat_conversations'`,
    [process.env.DB_NAME]
  )
  const columns = new Set(rows.map((row) => row.COLUMN_NAME))

  if (!columns.has('customer_domicile')) {
    console.log('Adding customer_domicile to live_chat_conversations...')
    await db.query(
      `ALTER TABLE live_chat_conversations
       ADD COLUMN customer_domicile VARCHAR(255) NULL AFTER customer_phone`
    )
  }
  if (!columns.has('customer_latitude')) {
    console.log('Adding customer_latitude to live_chat_conversations...')
    await db.query(
      `ALTER TABLE live_chat_conversations
       ADD COLUMN customer_latitude DECIMAL(10,7) NULL AFTER customer_domicile`
    )
  }
  if (!columns.has('customer_longitude')) {
    console.log('Adding customer_longitude to live_chat_conversations...')
    await db.query(
      `ALTER TABLE live_chat_conversations
       ADD COLUMN customer_longitude DECIMAL(10,7) NULL AFTER customer_latitude`
    )
  }
}

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
  await ensureLiveChatFaqColumns()
  await ensureLiveChatEnhancementColumns()
  if (faqSql) await db.query(faqSql)
  if (enhancementSql) {
    console.log('Executing database/migrations/007-live-chat-enhancements.sql...')
    await db.query(enhancementSql)
  }
  await ensureUtf8mb4()
  console.log('Migrasi Live Chat Gadai Sakti selesai.')
  console.log('Charset Live Chat: utf8mb4')
  console.log('FAQ, keyword, domisili/lokasi cabang, dan multi-admin Live Chat terverifikasi.')
  console.log('Tabel: live_chat_conversations, live_chat_messages, live_chat_quick_replies, live_chat_agent_presence')
} finally {
  await db.end()
}
