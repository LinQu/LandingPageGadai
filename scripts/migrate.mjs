import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'

async function runMigration() {
  const host = process.env.DB_HOST || '127.0.0.1'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''
  const database = process.env.DB_NAME || 'gadai_sakti'

  console.log(`Connecting to MySQL server at ${host}:${port}...`)
  const rootConn = await mysql.createConnection({ host, port, user, password })

  await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
  await rootConn.end()
  console.log(`Database "${database}" is ready.`)

  const db = await mysql.createConnection({ host, port, user, password, database, multipleStatements: true })

  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
  if (fs.existsSync(schemaPath)) {
    console.log('Executing database/schema.sql...')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    await db.query(sql)
  }

  // Ensure default_price column exists on pawn_product_variants if table existed before
  try {
    const [cols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'pawn_product_variants' AND COLUMN_NAME = 'default_price'`,
      [database]
    )
    if (cols.length === 0) {
      console.log('Adding missing column default_price to pawn_product_variants...')
      await db.query(`ALTER TABLE pawn_product_variants ADD COLUMN default_price BIGINT UNSIGNED NULL AFTER api_code`)
    }
  } catch (colErr) {
    console.warn('Column check warning:', colErr.message)
  }

  await db.end()
  console.log('Migration completed successfully!')
}

runMigration().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
