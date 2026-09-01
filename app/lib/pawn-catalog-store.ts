export type PawnStatus = 'active' | 'inactive'

export type PawnCategory = {
  id: number
  name: string
  slug: string
  image_url: string | null
  sort_order: number
  status: PawnStatus
}

export type PawnBrand = {
  id: number
  category_id: number
  name: string
  slug: string
  logo_url: string | null
  sort_order: number
  status: PawnStatus
}

export type PawnProduct = {
  id: number
  category_id: number
  brand_id: number
  name: string
  slug: string
  description: string | null
  search_keywords: string | null
  image_url: string | null
  sort_order: number
  status: PawnStatus
}

export type PawnVariant = {
  id: number
  product_id: number
  name: string
  api_code: string
  default_price: number | null
  internal_note: string | null
  sort_order: number
  status: PawnStatus
}

export type PawnCatalogProduct = {
  id: string
  category: string
  name: string
  aliases: string[]
  summary: string
  imageUrl?: string | null
  specs: Array<{
    id: string
    label: string
    apiCode: string
    note?: string
    minValuation?: number
    maxValuation?: number
  }>
}

export type PawnCatalogBrand = {
  id: string
  kodekat: string
  name: string
  slug: string
  logoUrl?: string | null
  sortOrder: number
  status: PawnStatus
  products: PawnCatalogProduct[]
}

export type PawnCatalogCategory = {
  id: string
  kode: string
  name: string
  icon: string
  imageUrl?: string | null
  sortOrder: number
  status: PawnStatus
  brands: PawnCatalogBrand[]
}

const categories: PawnCategory[] = [
  { id: 1, name: 'HP', slug: 'hp', image_url: '/HP.png', sort_order: 1, status: 'active' },
  { id: 2, name: 'Laptop', slug: 'laptop', image_url: '/LPTP.png', sort_order: 2, status: 'active' },
]

const brands: PawnBrand[] = [
  { id: 1, category_id: 1, name: 'APPLE', slug: 'apple', logo_url: null, sort_order: 1, status: 'active' },
  { id: 2, category_id: 1, name: 'SAMSUNG', slug: 'samsung', logo_url: null, sort_order: 2, status: 'active' },
  { id: 3, category_id: 1, name: 'XIAOMI', slug: 'xiaomi', logo_url: null, sort_order: 3, status: 'active' },
  { id: 4, category_id: 2, name: 'ASUS', slug: 'asus', logo_url: null, sort_order: 1, status: 'active' },
  { id: 5, category_id: 2, name: 'LENOVO', slug: 'lenovo', logo_url: null, sort_order: 2, status: 'active' },
  { id: 6, category_id: 2, name: 'DELL', slug: 'dell', logo_url: null, sort_order: 3, status: 'active' },
]

const products: PawnProduct[] = [
  { id: 1, category_id: 1, brand_id: 1, name: 'iPhone 11', slug: 'iphone-11', description: 'Data dummy iPhone 11 untuk simulasi.', search_keywords: 'iphone 11, iphone11', image_url: null, sort_order: 1, status: 'active' },
  { id: 2, category_id: 1, brand_id: 1, name: 'iPhone 11 Pro', slug: 'iphone-11-pro', description: 'Data dummy iPhone 11 Pro untuk simulasi.', search_keywords: 'iphone 11 pro, 11 pro', image_url: null, sort_order: 2, status: 'active' },
  { id: 3, category_id: 1, brand_id: 1, name: 'iPhone 13', slug: 'iphone-13', description: 'Data dummy iPhone 13 untuk simulasi.', search_keywords: 'iphone 13, 13', image_url: null, sort_order: 3, status: 'active' },
  { id: 4, category_id: 1, brand_id: 2, name: 'Samsung S21 FE', slug: 'samsung-s21-fe', description: 'Data dummy Samsung S21 FE untuk simulasi.', search_keywords: 's21 fe, samsung fe', image_url: null, sort_order: 4, status: 'active' },
  { id: 5, category_id: 1, brand_id: 3, name: 'Redmi Note 12', slug: 'redmi-note-12', description: 'Data dummy Redmi Note 12 untuk simulasi.', search_keywords: 'redmi note 12, note 12', image_url: null, sort_order: 5, status: 'active' },
  { id: 6, category_id: 2, brand_id: 4, name: 'Asus VivoBook 14', slug: 'asus-vivobook-14', description: 'Data dummy Asus VivoBook 14 untuk simulasi.', search_keywords: 'vivobook 14, asus vivobook 14', image_url: null, sort_order: 1, status: 'active' },
  { id: 7, category_id: 2, brand_id: 5, name: 'Lenovo IdeaPad Slim 3', slug: 'lenovo-ideapad-slim-3', description: 'Data dummy Lenovo IdeaPad Slim 3 untuk simulasi.', search_keywords: 'ideapad slim 3, lenovo ideapad slim 3', image_url: null, sort_order: 2, status: 'active' },
  { id: 8, category_id: 2, brand_id: 6, name: 'Dell Latitude 7420', slug: 'dell-latitude-7420', description: 'Data dummy Dell Latitude 7420 untuk simulasi.', search_keywords: 'latitude 7420, dell latitude 7420', image_url: null, sort_order: 3, status: 'active' },
]

const variants: PawnVariant[] = [
  { id: 1, product_id: 1, name: 'IBOX 64GB', api_code: 'IP_11_64GB_IBOX', default_price: 2200000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 2, product_id: 1, name: 'IBOX 128GB', api_code: 'IP_11_128GB_IBOX', default_price: 2500000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 3, product_id: 1, name: 'IBOX 256GB', api_code: 'IP_11_256GB_IBOX', default_price: 2800000, internal_note: 'Dummy data simulasi.', sort_order: 3, status: 'active' },
  { id: 4, product_id: 2, name: '64GB', api_code: 'IP_11_PRO_64GB', default_price: 3200000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 5, product_id: 2, name: '256GB', api_code: 'IP_11_PRO_256GB', default_price: 3500000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 6, product_id: 3, name: '128GB', api_code: 'IP_13_128GB', default_price: 4800000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 7, product_id: 3, name: '256GB', api_code: 'IP_13_256GB', default_price: 5200000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 8, product_id: 4, name: '128GB', api_code: 'S21FE_128GB', default_price: 2500000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 9, product_id: 4, name: '256GB', api_code: 'S21FE_256GB', default_price: 2850000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 10, product_id: 5, name: '128GB', api_code: 'REDMI_NOTE_12_128GB', default_price: 1200000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 11, product_id: 5, name: '256GB', api_code: 'REDMI_NOTE_12_256GB', default_price: 1400000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 12, product_id: 6, name: '8GB / 512GB', api_code: 'VIVOBOOK_8_512', default_price: 3200000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 13, product_id: 6, name: '16GB / 512GB', api_code: 'VIVOBOOK_16_512', default_price: 3800000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 14, product_id: 7, name: '8GB / 512GB', api_code: 'IDEAPAD_8_512', default_price: 2900000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 15, product_id: 7, name: '16GB / 512GB', api_code: 'IDEAPAD_16_512', default_price: 3600000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
  { id: 16, product_id: 8, name: '16GB / 256GB', api_code: 'LATITUDE_16_256', default_price: 5200000, internal_note: 'Dummy data simulasi.', sort_order: 1, status: 'active' },
  { id: 17, product_id: 8, name: '16GB / 512GB', api_code: 'LATITUDE_16_512', default_price: 5800000, internal_note: 'Dummy data simulasi.', sort_order: 2, status: 'active' },
]

let nextCategoryId = 3
let nextBrandId = 7
let nextProductId = 9
let nextVariantId = 18

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function statusOf(value: unknown): PawnStatus {
  return value === 'inactive' ? 'inactive' : 'active'
}

function text(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max)
}

function orderOf(value: unknown) {
  return Math.max(0, Math.min(65535, Number.parseInt(String(value || 0), 10) || 0))
}

function toCategory(category: PawnCategory): PawnCatalogCategory {
  return {
    id: String(category.id),
    kode: category.slug.toUpperCase(),
    name: category.name,
    icon: category.image_url ? (category.name.slice(0, 1).toUpperCase()) : '•',
    imageUrl: category.image_url,
    sortOrder: category.sort_order,
    status: category.status,
    brands: [],
  }
}

function buildCatalog(): PawnCatalogCategory[] {
  const categoriesById = new Map<number, PawnCatalogCategory>()
  const brandsById = new Map<number, PawnCatalogBrand>()
  const productsById = new Map<number, PawnCatalogProduct>()

  for (const category of [...categories].filter(item => item.status === 'active').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))) {
    categoriesById.set(category.id, toCategory(category))
  }

  for (const brand of [...brands].filter(item => item.status === 'active').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))) {
    const category = categoriesById.get(brand.category_id)
    if (!category) continue
    const entry: PawnCatalogBrand = {
      id: String(brand.id),
      kodekat: category.kode,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url,
      sortOrder: brand.sort_order,
      status: brand.status,
      products: [],
    }
    category.brands.push(entry)
    brandsById.set(brand.id, entry)
  }

  for (const product of [...products].filter(item => item.status === 'active').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))) {
    const brand = brandsById.get(product.brand_id)
    const category = categoriesById.get(product.category_id)
    if (!brand || !category) continue
    const entry: PawnCatalogProduct = {
      id: product.slug,
      category: category.kode,
      name: product.name,
      aliases: [product.name, product.slug, ...String(product.search_keywords || '').split(/[\s,;|]+/).filter(Boolean)],
      summary: product.description || product.search_keywords || '',
      imageUrl: product.image_url,
      specs: [],
    }
    brand.products.push(entry)
    productsById.set(product.id, entry)
  }

  for (const variant of [...variants].filter(item => item.status === 'active').sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))) {
    const product = productsById.get(variant.product_id)
    if (!product) continue
    product.specs.push({
      id: String(variant.id),
      label: variant.name,
      apiCode: variant.api_code,
      note: variant.internal_note || undefined,
      minValuation: variant.default_price ? Math.max(1000000, Math.round(variant.default_price * 0.85 / 500) * 500) : undefined,
      maxValuation: variant.default_price || undefined,
    })
  }

  return [...categoriesById.values()]
}

function normalizeCatalogCode(value: string) {
  return text(value, 80).trim().toUpperCase()
}

function brandForProductName(name: string) {
  const lower = name.toLowerCase()
  if (lower.includes('iphone') || lower.includes('macbook')) return 'APPLE'
  if (lower.includes('samsung') || lower.includes('galaxy')) return 'SAMSUNG'
  if (lower.includes('redmi') || lower.includes('xiaomi')) return 'XIAOMI'
  if (lower.includes('asus') || lower.includes('vivobook')) return 'ASUS'
  if (lower.includes('lenovo') || lower.includes('thinkpad') || lower.includes('ideapad')) return 'LENOVO'
  if (lower.includes('dell') || lower.includes('latitude')) return 'DELL'
  return normalizeCatalogCode(name.split(' ')[0] || 'UNKNOWN')
}

function ensureBrand(categoryId: number, brandName: string) {
  const found = brands.find(item => item.category_id === categoryId && item.name === brandName && item.status === 'active')
  if (found) return found
  const created: PawnBrand = {
    id: nextBrandId++,
    category_id: categoryId,
    name: brandName,
    slug: slugify(brandName),
    logo_url: null,
    sort_order: brands.filter(item => item.category_id === categoryId).length + 1,
    status: 'active',
  }
  brands.push(created)
  return created
}

function getCategoryById(id: number) {
  return categories.find(item => item.id === id) || null
}

function getBrandById(id: number) {
  return brands.find(item => item.id === id) || null
}

function getProductById(id: number) {
  return products.find(item => item.id === id) || null
}

function getVariantById(id: number) {
  return variants.find(item => item.id === id) || null
}

export function listCatalog(): PawnCatalogCategory[] {
  return buildCatalog()
}

export function listCategories(): PawnCategory[] {
  return [...categories].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
}

export function listBrands(): PawnBrand[] {
  return [...brands].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
}

export function listProducts(): PawnProduct[] {
  return [...products].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
}

export function listVariants() {
  return [...variants].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
}

export function createCategory(input: { name: string; slug?: string; imageUrl?: string; sortOrder?: number; status?: unknown }) {
  const name = text(input.name, 120)
  const slug = slugify(text(input.slug, 140) || name)
  const record: PawnCategory = {
    id: nextCategoryId++,
    name,
    slug,
    image_url: text(input.imageUrl, 1000) || null,
    sort_order: orderOf(input.sortOrder),
    status: statusOf(input.status),
  }
  categories.push(record)
  return record
}

export function updateCategory(id: number, input: { name: string; slug?: string; imageUrl?: string; sortOrder?: number; status?: unknown }) {
  const record = getCategoryById(id)
  if (!record) return null
  record.name = text(input.name, 120)
  record.slug = slugify(text(input.slug, 140) || record.name)
  record.image_url = text(input.imageUrl, 1000) || null
  record.sort_order = orderOf(input.sortOrder)
  record.status = statusOf(input.status)
  return record
}

export function createBrand(input: { name: string; slug?: string; logoUrl?: string; sortOrder?: number; status?: unknown; categoryId?: number }) {
  const categoryId = Number(input.categoryId)
  const category = getCategoryById(categoryId)
  if (!category) return null
  const name = text(input.name, 120)
  const slug = slugify(text(input.slug, 140) || name)
  const record: PawnBrand = {
    id: nextBrandId++,
    category_id: categoryId,
    name,
    slug,
    logo_url: text(input.logoUrl, 1000) || null,
    sort_order: orderOf(input.sortOrder),
    status: statusOf(input.status),
  }
  brands.push(record)
  return record
}

export function updateBrand(id: number, input: { name: string; slug?: string; logoUrl?: string; sortOrder?: number; status?: unknown; categoryId?: number }) {
  const record = getBrandById(id)
  if (!record) return null
  const categoryId = Number(input.categoryId || record.category_id)
  if (!getCategoryById(categoryId)) return null
  record.category_id = categoryId
  record.name = text(input.name, 120)
  record.slug = slugify(text(input.slug, 140) || record.name)
  record.logo_url = text(input.logoUrl, 1000) || null
  record.sort_order = orderOf(input.sortOrder)
  record.status = statusOf(input.status)
  return record
}

export function createProduct(input: { categoryId: number; brandId: number; name: string; slug?: string; description?: string; searchKeywords?: string; imageUrl?: string; sortOrder?: number; status?: unknown }) {
  const categoryId = Number(input.categoryId)
  const brandId = Number(input.brandId)
  const category = getCategoryById(categoryId)
  const brand = getBrandById(brandId)
  if (!category || !brand) return null
  const name = text(input.name, 180)
  const slug = slugify(text(input.slug, 190) || name)
  const record: PawnProduct = {
    id: nextProductId++,
    category_id: categoryId,
    brand_id: brandId,
    name,
    slug,
    description: text(input.description, 65535) || null,
    search_keywords: text(input.searchKeywords, 65535) || null,
    image_url: text(input.imageUrl, 1000) || null,
    sort_order: orderOf(input.sortOrder),
    status: statusOf(input.status),
  }
  products.push(record)
  return record
}

export function updateProduct(id: number, input: { categoryId: number; brandId: number; name: string; slug?: string; description?: string; searchKeywords?: string; imageUrl?: string; sortOrder?: number; status?: unknown }) {
  const record = getProductById(id)
  if (!record) return null
  const categoryId = Number(input.categoryId)
  const brandId = Number(input.brandId)
  if (!getCategoryById(categoryId) || !getBrandById(brandId)) return null
  record.category_id = categoryId
  record.brand_id = brandId
  record.name = text(input.name, 180)
  record.slug = slugify(text(input.slug, 190) || record.name)
  record.description = text(input.description, 65535) || null
  record.search_keywords = text(input.searchKeywords, 65535) || null
  record.image_url = text(input.imageUrl, 1000) || null
  record.sort_order = orderOf(input.sortOrder)
  record.status = statusOf(input.status)
  return record
}

export function createVariant(input: { productId: number; name: string; apiCode: string; defaultPrice?: number | null; internalNote?: string; sortOrder?: number; status?: unknown }) {
  const productId = Number(input.productId)
  if (!getProductById(productId)) return null
  const record: PawnVariant = {
    id: nextVariantId++,
    product_id: productId,
    name: text(input.name, 180),
    api_code: text(input.apiCode, 190),
    default_price: Number.isFinite(Number(input.defaultPrice)) ? Number(input.defaultPrice) : null,
    internal_note: text(input.internalNote, 65535) || null,
    sort_order: orderOf(input.sortOrder),
    status: statusOf(input.status),
  }
  variants.push(record)
  return record
}

export function updateVariant(id: number, input: { productId: number; name: string; apiCode: string; defaultPrice?: number | null; internalNote?: string; sortOrder?: number; status?: unknown }) {
  const record = getVariantById(id)
  if (!record) return null
  const productId = Number(input.productId)
  if (!getProductById(productId)) return null
  record.product_id = productId
  record.name = text(input.name, 180)
  record.api_code = text(input.apiCode, 190)
  record.default_price = Number.isFinite(Number(input.defaultPrice)) ? Number(input.defaultPrice) : null
  record.internal_note = text(input.internalNote, 65535) || null
  record.sort_order = orderOf(input.sortOrder)
  record.status = statusOf(input.status)
  return record
}

export function updateVariantPrice(id: number, defaultPrice: number | null) {
  const record = getVariantById(id)
  if (!record) return null
  record.default_price = defaultPrice
  return record
}

export function getCatalogByCategoryCode(categoryCode: string) {
  return listCatalog().find(item => item.kode === normalizeCatalogCode(categoryCode)) || null
}

export function addProductFromSimulation(input: { categoryCode: string; productName: string; variantName: string; apiCode: string; sortOrder?: number }) {
  const category = listCategories().find(item => item.slug.toUpperCase() === normalizeCatalogCode(input.categoryCode))
  if (!category) return null
  const brandName = brandForProductName(input.productName)
  const brand = ensureBrand(category.id, brandName)
  let product = products.find(item => item.category_id === category.id && item.brand_id === brand.id && item.slug === slugify(input.productName) && item.status === 'active')
  if (!product) {
    product = createProduct({ categoryId: category.id, brandId: brand.id, name: input.productName, slug: slugify(input.productName), description: `Data dummy ${input.productName} untuk simulasi.`, searchKeywords: input.productName.toLowerCase(), sortOrder: input.sortOrder || products.length + 1, status: 'active' }) || undefined
  }
  if (!product) return null
  return createVariant({ productId: product.id, name: input.variantName, apiCode: input.apiCode, internalNote: 'Dummy data simulasi.', sortOrder: input.sortOrder || variants.length + 1, status: 'active' })
}
