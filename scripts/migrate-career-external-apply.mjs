import { readFile } from 'node:fs/promises'
import mysql from 'mysql2/promise'

const sql = await readFile(new URL('../database/migrations/004-career-external-application-url.sql', import.meta.url), 'utf8')
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true,
  charset: 'utf8mb4',
})

try {
  await db.query(sql)
  console.log('Migrasi link lamaran eksternal karir selesai.')
} finally {
  await db.end()
}
