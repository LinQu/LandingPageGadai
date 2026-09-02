import { execute, queryRows } from './db'
import { slugify } from './slug'

export type PawnStatus = 'active' | 'inactive'

export function statusOf(value: unknown): PawnStatus {
  return value === 'inactive' ? 'inactive' : 'active'
}

export function text(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max)
}

export function orderOf(value: unknown) {
  return Math.max(0, Math.min(65535, Number.parseInt(String(value || 0), 10) || 0))
}

export function idOf(value: unknown) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}

export async function audit(adminId: number, entityType: string, entityId: number, action: string, before: unknown, after: unknown, ip?: string | null) {
  await execute(
    `INSERT INTO admin_audit_logs (admin_user_id, entity_type, entity_id, action, before_data, after_data, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [adminId, entityType, entityId, action, JSON.stringify(before), JSON.stringify(after), ip || null]
  )
}

export async function activeCodeIsTaken(apiCode: string, excludeId?: number) {
  if (!apiCode) return false
  const params: unknown[] = [apiCode]
  let sql = `SELECT id FROM pawn_product_variants WHERE api_code = ? AND api_code <> '' AND status = 'active'`
  if (excludeId) { sql += ' AND id <> ?'; params.push(excludeId) }
  return (await queryRows<{ id: number }>(sql, params)).length > 0
}

export function itemFields(body: any, type: 'category' | 'brand') {
  const name = text(body.name, 120)
  return {
    name,
    slug: slugify(text(body.slug, 140) || name),
    image: text(type === 'category' ? body.imageUrl : body.logoUrl, 1000) || null,
    sortOrder: orderOf(body.sortOrder),
    status: statusOf(body.status),
  }
}
