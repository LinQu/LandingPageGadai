import { NextRequest, NextResponse } from 'next/server'
import { findKecamatanByCoordinate, WilayahConfigurationError, WilayahProviderError } from '@/lib/services/wilayah.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseCoordinate(value: string | null): number | null {
  if (value === null || value.trim() === '') return null
  const coordinate = Number(value)
  return Number.isFinite(coordinate) ? coordinate : null
}

export async function GET(request: NextRequest) {
  const latitude = parseCoordinate(request.nextUrl.searchParams.get('lat'))
  const longitude = parseCoordinate(request.nextUrl.searchParams.get('lon'))
  if (latitude === null || longitude === null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ message: 'Latitude dan longitude tidak valid' }, { status: 400 })
  }
  try {
    const kecamatan = await findKecamatanByCoordinate(latitude, longitude)
    if (!kecamatan) return NextResponse.json({ message: 'Kecamatan tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ kecamatan })
  } catch (error) {
    if (error instanceof WilayahConfigurationError) return NextResponse.json({ message: 'Layanan wilayah belum dikonfigurasi' }, { status: 500 })
    if (error instanceof WilayahProviderError) {
      console.error('Nominatim reverse-geocoding gagal:', error.message)
      return NextResponse.json({ message: 'Layanan wilayah sedang tidak tersedia' }, { status: 502 })
    }
    console.error('API /api/wilayah/kecamatan error:', error)
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 })
  }
}
