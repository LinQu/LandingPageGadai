import { NextResponse } from 'next/server'
import { queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await queryRows<any>(
      `SELECT id, title, category
       FROM live_chat_quick_replies
       WHERE active = 1 AND auto_send = 1 AND customer_visible = 1
       ORDER BY CASE category
         WHEN 'Barang & Syarat Gadai' THEN 1
         WHEN 'Proses & Biaya Gadai' THEN 2
         WHEN 'Pelunasan & Pembayaran' THEN 3
         WHEN 'Lokasi & Kunjungan Cabang' THEN 4
         WHEN 'Pertanyaan Lainnya' THEN 5
         ELSE 99
       END, priority DESC, id ASC`
    )
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error('Live chat FAQ GET error:', error)
    return NextResponse.json({ error: 'FAQ Live Chat belum tersedia.' }, { status: 500 })
  }
}
