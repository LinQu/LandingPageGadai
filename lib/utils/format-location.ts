/**
 * Utility functions for standardizing and formatting location and branch text
 * without altering the underlying raw data.
 */

// Known acronyms and proper capitalizations
const KNOWN_WORDS: Record<string, string> = {
  dki: 'DKI',
  di: 'DI',
  diy: 'DI Yogyakarta',
  adm: 'Adm.',
  'adm.': 'Adm.',
  kab: 'Kab.',
  'kab.': 'Kab.',
  kabupaten: 'Kab.',
  kota: 'Kota',
  prov: 'Prov.',
  'prov.': 'Prov.',
  provinsi: 'Provinsi',
  rt: 'RT',
  rw: 'RW',
  no: 'No.',
  'no.': 'No.',
  kav: 'Kav.',
  'kav.': 'Kav.',
  lt: 'Lt.',
  'lt.': 'Lt.',
  jl: 'Jl.',
  'jl.': 'Jl.',
  jln: 'Jln.',
  'jln.': 'Jln.',
  wisma: 'Wisma',
  pt: 'PT',
  pos: 'POS',
  bri: 'BRI',
  bca: 'BCA',
  bni: 'BNI',
  mandiri: 'Mandiri',
  atm: 'ATM',
  spbu: 'SPBU',
}

// Exact normalized matches for commonly mashed or truncated province & city names
const EXACT_LOCATIONS: Record<string, string> = {
  // Yogyakarta
  daerahistimewayogyak: 'DI Yogyakarta',
  daerahistimewahyogya: 'DI Yogyakarta',
  daerahistimewayogyakarta: 'DI Yogyakarta',
  daerahistimewayogya: 'DI Yogyakarta',
  daerahistimewa: 'DI Yogyakarta',
  'daerah istimewa yogyakarta': 'DI Yogyakarta',
  'daerah istimewa yogya': 'DI Yogyakarta',
  'd.i. yogyakarta': 'DI Yogyakarta',
  'd.i. yogya': 'DI Yogyakarta',
  'd.i yogyakarta': 'DI Yogyakarta',
  'di yogyakarta': 'DI Yogyakarta',
  'di yogyakartak': 'DI Yogyakarta',
  diyogyakartak: 'DI Yogyakarta',
  diyogyakarta: 'DI Yogyakarta',
  diy: 'DI Yogyakarta',
  yogyakarta: 'DI Yogyakarta',
  kotayogyakarta: 'Kota Yogyakarta',

  // Jakarta
  kotaadmjakartaselat: 'Kota Adm. Jakarta Selatan',
  kotaadmjakartaselatan: 'Kota Adm. Jakarta Selatan',
  jakartaselat: 'Jakarta Selatan',
  jakartaselatan: 'Jakarta Selatan',
  kotaadmjakartabarat: 'Kota Adm. Jakarta Barat',
  jakartabarat: 'Jakarta Barat',
  kotaadmjakartatimur: 'Kota Adm. Jakarta Timur',
  jakartatimur: 'Jakarta Timur',
  kotaadmjakartapusat: 'Kota Adm. Jakarta Pusat',
  jakartapusat: 'Jakarta Pusat',
  kotaadmjakartautara: 'Kota Adm. Jakarta Utara',
  jakartautara: 'Jakarta Utara',
  dkijakarta: 'DKI Jakarta',
  'dki jakarta': 'DKI Jakarta',

  // Tangerang
  kotatangerangselatan: 'Kota Tangerang Selatan',
  tangerangselatan: 'Tangerang Selatan',
  kotatangerang: 'Kota Tangerang',
  kabtangerang: 'Kab. Tangerang',
  kabupatentangerang: 'Kab. Tangerang',
  tangerang: 'Tangerang',

  // Sulawesi
  sulawesiselatan: 'Sulawesi Selatan',
  'sulawesi selatan': 'Sulawesi Selatan',
  sulawesitengah: 'Sulawesi Tengah',
  'sulawesi tengah': 'Sulawesi Tengah',
  sulawesiutara: 'Sulawesi Utara',
  'sulawesi utara': 'Sulawesi Utara',
  sulawesitenggara: 'Sulawesi Tenggara',
  'sulawesi tenggara': 'Sulawesi Tenggara',
  sulawesibarat: 'Sulawesi Barat',
  'sulawesi barat': 'Sulawesi Barat',

  // Sumatera
  sumaterautara: 'Sumatera Utara',
  'sumatera utara': 'Sumatera Utara',
  sumaterabarat: 'Sumatera Barat',
  'sumatera barat': 'Sumatera Barat',
  sumateraselatan: 'Sumatera Selatan',
  'sumatera selatan': 'Sumatera Selatan',
  sumateratengah: 'Sumatera Tengah',

  // Jawa
  jawatengah: 'Jawa Tengah',
  'jawa tengah': 'Jawa Tengah',
  jawabarat: 'Jawa Barat',
  'jawa barat': 'Jawa Barat',
  jawatimur: 'Jawa Timur',
  'jawa timur': 'Jawa Timur',

  // Kalimantan
  kalimantantimur: 'Kalimantan Timur',
  'kalimantan timur': 'Kalimantan Timur',
  kalimantanbarat: 'Kalimantan Barat',
  'kalimantan barat': 'Kalimantan Barat',
  kalimantanselatan: 'Kalimantan Selatan',
  'kalimantan selatan': 'Kalimantan Selatan',
  kalimantantengah: 'Kalimantan Tengah',
  'kalimantan tengah': 'Kalimantan Tengah',
  kalimantanutara: 'Kalimantan Utara',
  'kalimantan utara': 'Kalimantan Utara',

  // Nusa Tenggara
  nusatenggarabarat: 'Nusa Tenggara Barat',
  'nusa tenggara barat': 'Nusa Tenggara Barat',
  nusatenggaratimur: 'Nusa Tenggara Timur',
  'nusa tenggara timur': 'Nusa Tenggara Timur',
  ntb: 'Nusa Tenggara Barat',
  ntt: 'Nusa Tenggara Timur',

  // Kepulauan & Lainnya
  bangkabelitung: 'Bangka Belitung',
  'bangka belitung': 'Bangka Belitung',
  kepulauanbangkabelitung: 'Kepulauan Bangka Belitung',
  'kepulauan bangka belitung': 'Kepulauan Bangka Belitung',
  kepulauanriau: 'Kepulauan Riau',
  'kepulauan riau': 'Kepulauan Riau',
  kepri: 'Kepulauan Riau',
  malukuutara: 'Maluku Utara',
  'maluku utara': 'Maluku Utara',

  // Papua
  papuabarat: 'Papua Barat',
  'papua barat': 'Papua Barat',
  papuaselatan: 'Papua Selatan',
  'papua selatan': 'Papua Selatan',
  papuatengah: 'Papua Tengah',
  'papua tengah': 'Papua Tengah',
  papuapegunungan: 'Papua Pegunungan',
  'papua pegunungan': 'Papua Pegunungan',
  papuabaratdaya: 'Papua Barat Daya',
  'papua barat daya': 'Papua Barat Daya',

  // Other common cities/regencies
  kotamakassar: 'Kota Makassar',
  kotasurakarta: 'Kota Surakarta',
  kotasurabaya: 'Kota Surabaya',
  kotabandung: 'Kota Bandung',
  kotabogor: 'Kota Bogor',
  kabbogor: 'Kab. Bogor',
  kabupatenbogor: 'Kab. Bogor',
  kotabekasi: 'Kota Bekasi',
  kabbekasi: 'Kab. Bekasi',
  kabupatenbekasi: 'Kab. Bekasi',
  kotadepok: 'Kota Depok',
  kotasemarang: 'Kota Semarang',
  kabsemarang: 'Kab. Semarang',
}

/**
 * Fixes broken/mashed words like "K OTAADM.J AKARTABARAT", "DAERAHISTIMEWAYOGYAK", "sulawesiselatan"
 */
function fixBrokenLocationString(raw: string): string {
  if (!raw) return ''

  let text = raw.trim()
  const cleanKey = text.toLowerCase().replace(/[^a-z0-9]/g, '')

  // 1. Direct match on exact normalized dictionary
  if (EXACT_LOCATIONS[cleanKey]) {
    return EXACT_LOCATIONS[cleanKey]
  }

  // 2. Fix known Jakarta Adm mashed / truncated patterns
  text = text
    .replace(/K\s*OTA\s*ADM\.?\s*J\s*AKARTA\s*SELAT(AN)?/gi, 'Kota Adm. Jakarta Selatan')
    .replace(/K\s*OTA\s*ADM\.?\s*J\s*AKARTA\s*BARAT/gi, 'Kota Adm. Jakarta Barat')
    .replace(/K\s*OTA\s*ADM\.?\s*J\s*AKARTA\s*TIMUR/gi, 'Kota Adm. Jakarta Timur')
    .replace(/K\s*OTA\s*ADM\.?\s*J\s*AKARTA\s*PUSAT/gi, 'Kota Adm. Jakarta Pusat')
    .replace(/K\s*OTA\s*ADM\.?\s*J\s*AKARTA\s*UTARA/gi, 'Kota Adm. Jakarta Utara')
    .replace(/JAKARTA\s*SELAT\b/gi, 'Jakarta Selatan')
    .replace(/K\s*OTA\s*ADM\.?\s*([A-Za-z]+)/gi, 'Kota Adm. $1')

  // 3. Fix mashed Tangerang Selatan
  text = text
    .replace(/K\s*OTA\s*TANGERANG\s*SELATAN/gi, 'Kota Tangerang Selatan')
    .replace(/TANGERANG\s*SELATAN/gi, 'Tangerang Selatan')

  // 4. Fix mashed "Kabupaten" / "Kab." patterns
  text = text
    .replace(/^KABUPATEN\s+/gi, 'Kab. ')
    .replace(/^KAB\.\s*/gi, 'Kab. ')
    .replace(/^KAB([A-Z][a-z]+)/g, 'Kab. $1')
    .replace(/^kab([a-z]+)/i, (_match, p1) => {
      const p1Clean = p1.toLowerCase()
      if (['upaten', 'ar', 'ila'].includes(p1Clean)) return text
      if (EXACT_LOCATIONS[p1Clean]) return `Kab. ${EXACT_LOCATIONS[p1Clean]}`
      return `Kab. ${p1Clean.charAt(0).toUpperCase() + p1Clean.slice(1)}`
    })

  // 5. Fix mashed "Kota" patterns
  text = text
    .replace(/^K\s*OTA\s*([A-Za-z]+)/gi, 'Kota $1')
    .replace(/^kota([a-z]+)/i, (_match, p1) => {
      const p1Clean = p1.toLowerCase()
      if (['k', 'si'].includes(p1Clean)) return text
      if (EXACT_LOCATIONS[p1Clean]) return `Kota ${EXACT_LOCATIONS[p1Clean]}`
      return `Kota ${p1Clean.charAt(0).toUpperCase() + p1Clean.slice(1)}`
    })

  // 6. Split merged directional words (selatan, barat, timur, utara, pusat, tengah)
  text = text
    .replace(/([a-z]+)(selatan|barat|timur|utara|pusat|tengah)\b/gi, '$1 $2')

  // 7. Fix remaining generic regional mashed words
  text = text
    .replace(/daerah\s*istimewa\s*yogyakarta/gi, 'DI Yogyakarta')
    .replace(/daerah\s*istimewa\s*yogya/gi, 'DI Yogyakarta')
    .replace(/sulawesi\s*selatan/gi, 'Sulawesi Selatan')
    .replace(/sulawesi\s*tengah/gi, 'Sulawesi Tengah')
    .replace(/sulawesi\s*utara/gi, 'Sulawesi Utara')
    .replace(/sulawesi\s*tenggara/gi, 'Sulawesi Tenggara')
    .replace(/sulawesi\s*barat/gi, 'Sulawesi Barat')
    .replace(/sumatera\s*utara/gi, 'Sumatera Utara')
    .replace(/sumatera\s*barat/gi, 'Sumatera Barat')
    .replace(/sumatera\s*selatan/gi, 'Sumatera Selatan')
    .replace(/kalimantan\s*timur/gi, 'Kalimantan Timur')
    .replace(/kalimantan\s*barat/gi, 'Kalimantan Barat')
    .replace(/kalimantan\s*selatan/gi, 'Kalimantan Selatan')
    .replace(/kalimantan\s*tengah/gi, 'Kalimantan Tengah')
    .replace(/kalimantan\s*utara/gi, 'Kalimantan Utara')
    .replace(/nusa\s*tenggara\s*barat/gi, 'Nusa Tenggara Barat')
    .replace(/nusa\s*tenggara\s*timur/gi, 'Nusa Tenggara Timur')
    .replace(/bangka\s*belitung/gi, 'Bangka Belitung')
    .replace(/kepulauan\s*riau/gi, 'Kepulauan Riau')
    .replace(/maluku\s*utara/gi, 'Maluku Utara')
    .replace(/papua\s*barat/gi, 'Papua Barat')
    .replace(/papua\s*selatan/gi, 'Papua Selatan')
    .replace(/papua\s*tengah/gi, 'Papua Tengah')
    .replace(/papua\s*pegunungan/gi, 'Papua Pegunungan')
    .replace(/papua\s*barat\s*daya/gi, 'Papua Barat Daya')
    .replace(/DKI\s*JAKARTA/gi, 'DKI Jakarta')
    .replace(/JAWA\s*TENGAH/gi, 'Jawa Tengah')
    .replace(/JAWA\s*BARAT/gi, 'Jawa Barat')
    .replace(/JAWA\s*TIMUR/gi, 'Jawa Timur')

  return text
}

/**
 * Standardizes a province or city string into Title Case with proper acronym handling.
 */
export function formatLocationName(value: string | undefined | null): string {
  if (!value) return ''

  const fixed = fixBrokenLocationString(value)

  const cleanFixedKey = fixed.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (EXACT_LOCATIONS[cleanFixedKey]) {
    return EXACT_LOCATIONS[cleanFixedKey]
  }

  // Split by space and format each token
  const words = fixed.split(/\s+/).filter(Boolean)
  const formatted = words.map(word => {
    const lower = word.toLowerCase()
    if (KNOWN_WORDS[lower]) {
      return KNOWN_WORDS[lower]
    }

    // Check if word contains dots like 'Adm.Jakarta'
    if (word.includes('.') && !word.endsWith('.')) {
      const subParts = word.split('.')
      return subParts
        .map(p => formatLocationName(p))
        .join('. ')
    }

    // Normal Capitalization
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  })

  return formatted.join(' ')
}

/**
 * Standardizes an address string: collapses extra spacing, standardizes common road terms.
 */
export function formatAddress(address: string | undefined | null): string {
  if (!address) return ''

  return address
    .replace(/\s+/g, ' ')
    .replace(/\bJl\s*\.\s*/gi, 'Jl. ')
    .replace(/\bNo\s*\.\s*/gi, 'No. ')
    .replace(/\bRt\s*\.\s*/gi, 'RT ')
    .replace(/\bRw\s*\.\s*/gi, 'RW ')
    .replace(/\bKav\s*\.\s*/gi, 'Kav. ')
    .replace(/\bLt\s*\.\s*/gi, 'Lt. ')
    .trim()
}

/**
 * Formats job placement location: "Jakarta Barat - Slipi", "Kab. Tegal - Mejasem Barat",
 * or just the city/regency if placement detail is empty.
 */
export function formatPlacement(
  city: string | undefined | null,
  placementDetail?: string | null
): string {
  const formattedCity = formatLocationName(city)
  const detail = placementDetail?.trim()
  if (!detail) return formattedCity
  if (!formattedCity) return detail
  return `${formattedCity} - ${detail}`
}

