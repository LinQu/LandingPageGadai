import { NextResponse } from 'next/server'
import { fetchFromNss } from '@/lib/internal/nss'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const noHP = url.searchParams.get('noHP') || ''

  if (!noHP) {
    return NextResponse.json({ status: 'error', message: 'noHP is required' }, { status: 400 })
  }

  try {
    const data = await fetchFromNss(noHP)
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('API Barang Error:', error.message)
    return NextResponse.json({ status: 'error', message: error.message, Detail: [] }, { status: 502 })
  }
}