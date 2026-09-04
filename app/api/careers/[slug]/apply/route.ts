import { NextRequest, NextResponse } from 'next/server'
import { queryRows } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params
  const jobs = await queryRows<{ application_url: string | null }>(`
    SELECT application_url
    FROM job_positions
    WHERE slug=? AND status='published'
      AND (application_deadline IS NULL OR application_deadline >= NOW())
    LIMIT 1
  `, [slug])

  if (!jobs[0]) {
    return NextResponse.json({ error: 'Lowongan tidak ditemukan atau sudah ditutup.' }, { status: 404 })
  }

  return NextResponse.json({
    error: 'Lamaran untuk posisi ini sudah dialihkan ke sistem rekrutmen Nusantara Sakti.',
    applicationUrl: jobs[0].application_url,
  }, { status: 410 })
}
