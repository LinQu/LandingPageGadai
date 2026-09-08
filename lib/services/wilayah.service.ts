export interface NominatimGeocoding {
  label?: string
  country?: string
  state?: string
  city?: string
  county?: string
  district?: string
  locality?: string
  admin?: {
    level4?: string
    level5?: string
    level6?: string
    level7?: string
  }
}

export interface NominatimFeature {
  properties?: { geocoding?: NominatimGeocoding }
}

export interface NominatimReverseResponse {
  features?: NominatimFeature[]
}

export type WilayahResult = { provinsi: string | null; kota: string | null; kecamatan: string | null }

export class WilayahConfigurationError extends Error {}
export class WilayahProviderError extends Error {}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse'
let nextNominatimRequestAt = 0
let requestQueue: Promise<void> = Promise.resolve()

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

async function waitForNominatimSlot() {
  const slot = requestQueue.then(async () => {
    const delay = Math.max(0, nextNominatimRequestAt - Date.now())
    if (delay) await new Promise<void>(resolve => setTimeout(resolve, delay))
    nextNominatimRequestAt = Date.now() + 1000
  })
  requestQueue = slot.catch(() => undefined)
  await slot
}

export function wilayahFromNominatim(response: NominatimReverseResponse): WilayahResult {
  const geocoding = response.features?.[0]?.properties?.geocoding
  if (!geocoding) return { provinsi: null, kota: null, kecamatan: null }

  // Indonesian administrative hierarchy: 4 province, 5 city/regency,
  // 6 district (kecamatan), 7 village/kelurahan. Level 7 is deliberately ignored.
  const provinsi = asText(geocoding.admin?.level4) ?? asText(geocoding.state)
  const kota = asText(geocoding.admin?.level5) ?? asText(geocoding.county) ?? asText(geocoding.city)
  const kecamatan = kota ? (asText(geocoding.admin?.level6) ?? asText(geocoding.district)) : null
  return { provinsi, kota, kecamatan }
}

export async function reverseGeocodeWilayah(latitude: number, longitude: number): Promise<WilayahResult> {
  const userAgent = process.env.NOMINATIM_USER_AGENT
  if (!userAgent) throw new WilayahConfigurationError('NOMINATIM_USER_AGENT belum dikonfigurasi.')

  await waitForNominatimSlot()
  const url = new URL(NOMINATIM_URL)
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('format', 'geocodejson')
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('accept-language', 'id')
  url.searchParams.set('layer', 'address')

  const timeoutMs = Number(process.env.NOMINATIM_TIMEOUT_MS || 5000)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 5000)
  try {
    const response = await fetch(url, { headers: { 'User-Agent': userAgent, 'Accept-Language': 'id' }, signal: controller.signal })
    if (!response.ok) throw new WilayahProviderError(`Nominatim HTTP ${response.status}`)
    let payload: NominatimReverseResponse
    try { payload = await response.json() as NominatimReverseResponse } catch { throw new WilayahProviderError('Respons Nominatim tidak valid.') }
    return wilayahFromNominatim(payload)
  } catch (error) {
    if (error instanceof WilayahProviderError) throw error
    throw new WilayahProviderError('Nominatim tidak dapat dihubungi.')
  } finally { clearTimeout(timer) }
}

export async function findKecamatanByCoordinate(latitude: number, longitude: number): Promise<string | null> {
  return (await reverseGeocodeWilayah(latitude, longitude)).kecamatan
}
