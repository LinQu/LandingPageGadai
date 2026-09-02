import mysql from 'mysql2/promise'
// Kept as plain JavaScript so this seed works on the project's Node.js 20 runtime.
const SIMULATION_CATEGORIES = [{ kode: 'HP', name: 'HP' }, { kode: 'LAPTOP', name: 'Laptop' }]
const SIMULATION_CATALOG = {
  HP: [
    ['iphone-11','iPhone 11',['IBOX 64GB','IBOX 128GB','IBOX 256GB','INTER 64GB','INTER 128GB','INTER 256GB']],
    ['iphone-11-pro','iPhone 11 Pro',['64GB','256GB']], ['iphone-11-pro-max','iPhone 11 Pro Max',['64GB','256GB']],
    ['iphone-13','iPhone 13',['128GB','256GB']], ['samsung-s21-fe','Samsung S21 FE',['128GB','256GB']], ['redmi-note-12','Redmi Note 12',['128GB','256GB']],
  ],
  LAPTOP: [
    ['macbook-air-m1','MacBook Air M1',['256GB','512GB']], ['macbook-pro-m1','MacBook Pro M1',['256GB','512GB']],
    ['asus-vivobook-14','Asus VivoBook 14',['8GB / 512GB','16GB / 512GB']], ['lenovo-ideapad-slim-3','Lenovo IdeaPad Slim 3',['8GB / 512GB','16GB / 512GB']],
    ['thinkpad-t14','ThinkPad T14',['8GB / 256GB','16GB / 512GB']], ['dell-latitude-7420','Dell Latitude 7420',['16GB / 256GB','16GB / 512GB']],
  ],
}

const brandFor = (name) => {
  const first = name.split(' ')[0]
  if (/^iphone|^macbook/i.test(name)) return 'Apple'
  if (/^samsung/i.test(name)) return 'Samsung'
  if (/^redmi/i.test(name)) return 'Xiaomi'
  if (/^asus/i.test(name)) return 'Asus'
  if (/^lenovo|^thinkpad/i.test(name)) return 'Lenovo'
  if (/^dell/i.test(name)) return 'Dell'
  return first
}

const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const apiCode = (id, name) => {
  if (id === 'iphone-11') {
    if (name === 'IBOX 64GB') return 'IP_11_64GB_IBOX'
    if (name === 'IBOX 128GB') return 'IP_11_128GB_IBOX'
    if (name === 'IBOX 256GB') return 'IP_11_256GB_IBOX'
  }
  return `${id}_${name}`.toUpperCase().replace(/[^A-Z0-9]+/g, '_')
}

const db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, charset: 'utf8mb4' })
try {
  await db.beginTransaction()
  for (const category of SIMULATION_CATEGORIES) {
    const categorySlug = slug(category.name)
    await db.execute(`INSERT INTO pawn_categories (name, slug, sort_order, status) VALUES (?, ?, ?, 'active') ON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order), status='active'`, [category.name, categorySlug, category.kode === 'HP' ? 1 : 2])
  }
  const brands = [...new Set(Object.values(SIMULATION_CATALOG).flat().map(([, name]) => brandFor(name)))].sort()
  for (const brand of brands) await db.execute(`INSERT INTO pawn_brands (name, slug, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE name=VALUES(name), status='active'`, [brand, slug(brand)])
  let productCount = 0, variantCount = 0
  for (const [categoryCode, items] of Object.entries(SIMULATION_CATALOG)) {
    const [[category]] = await db.query('SELECT id FROM pawn_categories WHERE slug=? LIMIT 1', [slug(categoryCode === 'HP' ? 'HP' : 'Laptop')])
    for (const [itemId, itemName, specs] of items) {
      const [[brand]] = await db.query('SELECT id FROM pawn_brands WHERE slug=? LIMIT 1', [slug(brandFor(itemName))])
      await db.execute(`INSERT INTO pawn_products (category_id, brand_id, name, slug, description, search_keywords, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active') ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), brand_id=VALUES(brand_id), name=VALUES(name), description=VALUES(description), search_keywords=VALUES(search_keywords), status='active'`, [category.id, brand.id, itemName, itemId, `Data dummy ${itemName} untuk simulasi.`, itemName.toLowerCase(), productCount++])
      const [[product]] = await db.query('SELECT id FROM pawn_products WHERE slug=? LIMIT 1', [itemId])
      for (const specName of specs) {
        const [existing] = await db.query('SELECT id FROM pawn_product_variants WHERE product_id=? AND name=? LIMIT 1', [product.id, specName])
        const defaultPrice = /iphone-13/i.test(itemId) ? 5000000 : /iphone-11-pro/i.test(itemId) ? 3500000 : /iphone-11/i.test(itemId) ? 2500000 : /macbook/i.test(itemId) ? 6500000 : 3000000
        const values = [product.id, specName, apiCode(itemId, specName), defaultPrice, 'Data awal simulasi.', variantCount++, 'active']
        if (existing.length) await db.execute('UPDATE pawn_product_variants SET api_code=?, default_price=COALESCE(default_price, ?), internal_note=?, sort_order=?, status=? WHERE id=?', [values[2], values[3], values[4], values[5], values[6], existing[0].id])
        else await db.execute('INSERT INTO pawn_product_variants (product_id, name, api_code, default_price, internal_note, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)', values)
      }
    }
  }
  await db.commit()
  console.log(`Seed selesai: ${productCount} produk dan ${variantCount} variant dummy siap digunakan.`)
} catch (error) { await db.rollback(); throw error } finally { await db.end() }
