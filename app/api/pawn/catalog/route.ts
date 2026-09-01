import { NextResponse } from 'next/server'
import { listCatalog } from '@/lib/pawn-catalog-store'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ data: listCatalog() })
}