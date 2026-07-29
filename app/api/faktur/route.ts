import { execFile } from 'child_process'
import { promisify } from 'util'
import { NextRequest, NextResponse } from 'next/server'
import type { FakturApiResponse } from '@/lib/faktur/types'

const execFileAsync = promisify(execFile)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeLegacyResponse(raw: string): string {
  let cleaned = raw.trim().replace(/^\uFEFF/, '')

  // The legacy service sometimes returns an unquoted `status=...` property.
  cleaned = cleaned.replace(/^(\{\s*)status\s*=\s*([^,}]+)\s*,/i, (_match, prefix, value) => {
    const status = String(value).trim().replace(/^['"]|['"]$/g, '')
    return `${prefix}"status":${JSON.stringify(status)},`
  })

  return cleaned.replace(/,\s*}/g, '}')
}

function createRequestBody(nomorFaktur: string): string {
  return JSON.stringify({
    api_jsoncmonss: [{
      Request: 'FAKTURMGA',
      noHP: nomorFaktur,
      tanggalAwal: '0000-00-00',
      tanggalAkhir: '0000-00-00',
      latMulai: '0.00',
      lonMulai: '0.00',
      jamMulai: '-10:00:00',
    }],
  })
}

export async function GET(request: NextRequest) {
  const nomorFaktur = request.nextUrl.searchParams.get('nomor')?.trim()
  if (!nomorFaktur) {
    return NextResponse.json({ status: 'error', message: 'Nomor faktur wajib diisi.' }, { status: 400 })
  }

  // Intentionally use curl, as this legacy server only accepts a raw body on GET.
  // It follows the proven cabang/barang proxy implementation exactly.
  const apiUrl = process.env.NSS_API_URL
  if (!apiUrl) {
    return NextResponse.json({ status: 'error', message: 'Layanan status faktur belum dikonfigurasi.' }, { status: 500 })
  }

  try {
    const { stdout } = await execFileAsync('curl', [
      '--silent',
      '--location',
      '--request',
      'GET',
      apiUrl,
      '--header',
      'Content-Type: application/json',
      '--data',
      createRequestBody(nomorFaktur),
    ], { timeout: 15_000, maxBuffer: 1024 * 1024 })

    if (!stdout.trim()) {
      throw new Error('Legacy API returned an empty response')
    }

    const data = JSON.parse(normalizeLegacyResponse(stdout)) as FakturApiResponse
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Layanan status faktur sedang tidak dapat diakses. Silakan coba lagi.' },
      { status: 502 }
    )
  }
}
