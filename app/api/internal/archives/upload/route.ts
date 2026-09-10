import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getCurrentAdmin } from '@/lib/internal/auth'

export const runtime = 'nodejs'

const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
const ALLOWED_IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

function sanitizeFileName(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase()
  const baseName = path.basename(originalName, ext)
  const sanitizedBase = baseName
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return `${Date.now()}-${sanitizedBase || 'dokumen'}${ext}`
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null // 'document' | 'cover'

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File tidak ditemukan dalam form upload.' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file melebihi batas maksimal (50MB).' }, { status: 400 })
    }

    const ext = path.extname(file.name).toLowerCase()

    if (type === 'cover') {
      if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: `Format cover tidak didukung. Format yang diizinkan: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}` }, { status: 400 })
      }
    } else {
      if (!ALLOWED_DOC_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: `Format dokumen tidak didukung. Format yang diizinkan: ${ALLOWED_DOC_EXTENSIONS.join(', ')}` }, { status: 400 })
      }
    }

    const safeFileName = sanitizeFileName(file.name)
    const subDir = type === 'cover' ? 'uploads/archives/covers' : 'uploads/archives'
    const targetDir = path.join(process.cwd(), 'public', subDir)

    await fs.mkdir(targetDir, { recursive: true })

    const filePath = path.join(targetDir, safeFileName)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await fs.writeFile(filePath, buffer)

    const fileUrl = `/${subDir}/${safeFileName}`

    return NextResponse.json({
      ok: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    })
  } catch (error: any) {
    console.error('Archive upload error:', error)
    return NextResponse.json({ error: `Gagal mengunggah file: ${error.message || 'Terjadi kesalahan sistem.'}` }, { status: 500 })
  }
}

