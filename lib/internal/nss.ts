import { execFile } from 'child_process'
import https from 'https'
import { promisify } from 'util'
import { execute } from './db'

const execFileAsync = promisify(execFile)

function normalizeBarangResponse(raw: string): string {
  let cleaned = raw.trim().replace(/^\uFEFF/, '')

  cleaned = cleaned.replace(/^(\{\s*)status\s*=\s*([^,}]+)\s*,/i, (_match, prefix, statusValue) => {
    const status = String(statusValue).trim().replace(/^['"]|['"]$/g, '')
    return `${prefix}"status":${JSON.stringify(status)},`
  })

  cleaned = cleaned.replace(/,\s*}/g, '}')

  cleaned = cleaned.replace(/"alamat":"([\s\S]*?)",/g, (_, alamat) => {
    const fixed = alamat.replace(/\r/g, '').replace(/\n/g, '\\n')
    return `"alamat":"${fixed}",`
  })

  return cleaned
}

export async function fetchFromNss(noHP: string): Promise<any> {
  const nssUrl = process.env.NSS_API_URL
  if (!nssUrl) {
    throw new Error('NSS_API_URL belum dikonfigurasi.')
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

  let parsedData: any = null

  try {
    parsedData = await new Promise((resolve, reject) => {
      const url = new URL(nssUrl)
      const req = https.request(
        {
          hostname: url.hostname,
          port: url.port ? Number(url.port) : 443,
          path: url.pathname + url.search,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
          },
          rejectUnauthorized: false,
          insecureHTTPParser: true,
          timeout: 15000,
        },
        res => {
          let data = ''
          res.on('data', chunk => {
            data += chunk
          })
          res.on('end', () => {
            try {
              const cleaned = normalizeBarangResponse(data)
              const parsed = JSON.parse(cleaned)
              resolve(parsed)
            } catch (err: any) {
              reject(new Error(`Failed to parse NSS response: ${err.message}`))
            }
          })
        }
      )

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('NSS API request timeout'))
      })

      req.on('error', err => {
        reject(err)
      })

      req.write(body)
      req.end()
    })
  } catch {
    try {
      const { stdout } = await execFileAsync('curl', [
        '--silent',
        '--show-error',
        '--insecure',
        '--max-time',
        '15',
        '--location',
        '--request',
        'GET',
        nssUrl,
        '--header',
        'Content-Type: application/json',
        '--data',
        body,
      ])

      const cleaned = normalizeBarangResponse(stdout)
      parsedData = JSON.parse(cleaned)
    } catch (curlError: any) {
      console.error('NSS API curl error:', curlError.message)
      throw new Error(`Gagal menghubungi API NSS: ${curlError.message}`)
    }
  }

  // Jika berhasil mendapatkan data harga dari API NSS, langsung simpan / update default_price di MySQL
  if (parsedData?.Detail && Array.isArray(parsedData.Detail) && parsedData.Detail.length > 0) {
    const prices = parsedData.Detail
      .map((d: any) => Number(d.hargamaxcair || 0))
      .filter((p: number) => !isNaN(p) && p > 0)

    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
    if (maxPrice > 0) {
      try {
        await execute(
          `UPDATE pawn_product_variants SET default_price = ? WHERE api_code = ? AND api_code <> '' AND api_code <> '-'`,
          [Math.round(maxPrice), noHP]
        )
      } catch (dbErr: any) {
        console.error('Auto-update default_price from NSS API error:', dbErr.message)
      }
    }
  }

  return parsedData
}

