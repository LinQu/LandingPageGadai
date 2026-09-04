import fs from 'fs'
import path from 'path'
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
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) {
      process.env[key] = val
    }
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'))
loadEnvFile(path.join(process.cwd(), '.env'))

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

  // Ensure placement_detail and application_url exist on job_positions
  try {
    const [jobCols] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'job_positions'`,
      [database]
    )
    const colNames = jobCols.map(c => c.COLUMN_NAME)
    if (!colNames.includes('placement_detail')) {
      console.log('Adding missing column placement_detail to job_positions...')
      await db.query(`ALTER TABLE job_positions ADD COLUMN placement_detail VARCHAR(255) NULL AFTER location_province`)
    }
    if (!colNames.includes('application_url')) {
      console.log('Adding missing column application_url to job_positions...')
      await db.query(`ALTER TABLE job_positions ADD COLUMN application_url VARCHAR(1000) NULL AFTER application_deadline`)
    }
    console.log('job_positions columns verified:', colNames)
  } catch (jobErr) {
    console.warn('Job positions column check warning:', jobErr.message)
  }

  // Ensure pawn_category_brands table exists and backfill from pawn_products
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pawn_category_brands (
        category_id BIGINT UNSIGNED NOT NULL,
        brand_id BIGINT UNSIGNED NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (category_id, brand_id),
        KEY idx_pawn_cat_brand_brand (brand_id),
        CONSTRAINT fk_pawn_cat_brand_category FOREIGN KEY (category_id) REFERENCES pawn_categories(id) ON DELETE CASCADE,
        CONSTRAINT fk_pawn_cat_brand_brand FOREIGN KEY (brand_id) REFERENCES pawn_brands(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `)

    await db.query(`
      INSERT IGNORE INTO pawn_category_brands (category_id, brand_id)
      SELECT DISTINCT category_id, brand_id
      FROM pawn_products
      WHERE category_id IS NOT NULL AND brand_id IS NOT NULL
    `)
    console.log('pawn_category_brands table and relationships verified.')
  } catch (cbErr) {
    console.warn('Category-brands setup warning:', cbErr.message)
  }

  await db.end()
  console.log('Migration completed successfully!')
}

runMigration().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
