import { execFile } from 'child_process'
import { promisify } from 'util'
import { NextResponse } from 'next/server'

const execFileAsync = promisify(execFile)

function normalizeBarangResponse(raw: string): string {
  let cleaned = raw.trim().replace(/^\uFEFF/, '')

  cleaned = cleaned.replace(/^(\{\s*)status\s*=\s*([^,}]+)\s*,/i, (_match, prefix, statusValue) => {
    const status = String(statusValue).trim().replace(/^['"]|['"]$/g, '')
    return `${prefix}"status":${JSON.stringify(status)},`
  })

  cleaned = cleaned.replace(/,\s*}/g, '}')

  return cleaned
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const noHP = url.searchParams.get('noHP') || ''

  if (!noHP) {
    return NextResponse.json({ status: 'error', message: 'noHP is required' }, { status: 400 })
  }

  const body = JSON.stringify({
    api_jsoncmonss: [
      {
        Request: 'BARANGGADAI',
        noHP,
        tanggalAwal: '0000-00-00',
        tanggalAkhir: '0000-00-00',
        latMulai: '0.00',
        lonMulai: '0.00',
        jamMulai: '-10:00:00',
      },
    ],
  })

  const { stdout } = await execFileAsync('curl', [
    '--silent',
    '--location',
    '--request',
    'GET',
    process.env.NSS_API_URL!,
    '--header',
    'Content-Type: application/json',
    '--data',
    body,
  ])

  const cleaned = stdout.replace(/"alamat":"([\s\S]*?)",/g, (_, alamat) => {
    const fixed = alamat.replace(/\r/g, '').replace(/\n/g, '\\n')
    return `"alamat":"${fixed}",`
  })

  const data = JSON.parse(normalizeBarangResponse(cleaned))

  return NextResponse.json(data)
}