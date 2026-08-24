import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, createAdminSession } from '@/lib/internal/auth'
import { isDatabaseConfigured } from '@/lib/internal/db'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'MySQL belum dikonfigurasi. Ikuti INTERNAL-SETUP.md terlebih dahulu.' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })
  }

  try {
    const admin = await authenticateAdmin(email, password)
    if (!admin) return NextResponse.json({ error: 'Email atau password tidak valid.' }, { status: 401 })

    await createAdminSession(admin.id)
    return NextResponse.json({ ok: true, user: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } })
  } catch (error) {
    console.error('Internal login error:', error)
    return NextResponse.json({ error: 'Login gagal. Periksa koneksi database.' }, { status: 500 })
  }
}
