
let poolPromise: Promise<any> | null = null

export function isDatabaseConfigured() {
  return Boolean(
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  )
}

export async function getDb() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database MySQL belum dikonfigurasi. Isi DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, dan DB_NAME.')
  }

  if (!poolPromise) {
    poolPromise = import('mysql2/promise').then(({ createPool }) =>
      createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
        queueLimit: 0,
        charset: 'utf8mb4',
        timezone: 'Z',
      })
    )
  }

  return poolPromise
}

export async function queryRows<T = any>(sql: string, params: unknown[] = []): Promise<T[]> {
  const db = await getDb()
  const [rows] = await db.execute(sql, params)
  return rows as T[]
}

export async function execute(sql: string, params: unknown[] = []) {
  const db = await getDb()
  const [result] = await db.execute(sql, params)
  return result as any
}
