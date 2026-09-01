import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/internal/auth'
import { text } from '@/lib/internal/pawn'

export const runtime = 'nodejs'
const execFileAsync = promisify(execFile)
function normalize(raw: string) { return raw.trim().replace(/^\uFEFF/, '').replace(/^(\{\s*)status\s*=\s*([^,}]+)\s*,/i, (_m,p,v) => `${p}"status":${JSON.stringify(String(v).trim().replace(/^['"]|['"]$/g,''))},`).replace(/,\s*}/g,'}') }
export async function POST(request: NextRequest) {
  if (!await getCurrentAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const apiCode = text((await request.json().catch(() => ({}))).apiCode, 190)
  if (!apiCode) return NextResponse.json({ error: 'API code wajib diisi.' }, { status: 400 })
  if (!process.env.NSS_API_URL) return NextResponse.json({ error: 'NSS_API_URL belum dikonfigurasi.' }, { status: 503 })
  const body = JSON.stringify({ api_jsoncmonss: [{ Request:'BARANGGADAI', noHP:apiCode, tanggalAwal:'0000-00-00', tanggalAkhir:'0000-00-00', latMulai:'0.00', lonMulai:'0.00', jamMulai:'-10:00:00' }] })
  try {
    const { stdout } = await execFileAsync('curl', ['--silent','--show-error','--max-time','20','--location','--request','GET',process.env.NSS_API_URL,'--header','Content-Type: application/json','--data',body])
    const data = JSON.parse(normalize(stdout.replace(/"alamat":"([\s\S]*?)",/g, (_m,v) => `"alamat":"${v.replace(/\r/g,'').replace(/\n/g,'\\n')}",`)))
    const detail = Array.isArray(data.Detail) ? data.Detail[0] : null
    if (!detail?.kodebarang || !detail?.kodecabang) return NextResponse.json({ success:false, data:null, message:'API code tidak valid atau tidak memiliki estimasi cabang.' })
    return NextResponse.json({ success:true, data:{ branch:{ code:detail.kodecabang, name:detail.namacabang || detail.namaCabang || detail.kodecabang }, product:{ name:detail.namabarang || apiCode, variant:detail.variant || apiCode }, maxCash:Number(detail.hargamaxcair || 0), checkedAt:new Date().toISOString() } })
  } catch (error) { console.error('NSS BARANGGADAI test failed', error); return NextResponse.json({ error:'Gagal menghubungi NSS BARANGGADAI.' }, { status:502 }) }
}
