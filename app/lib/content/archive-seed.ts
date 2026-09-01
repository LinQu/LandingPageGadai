import type { CompanyArchive } from '@/lib/types'

export const archiveSeed: CompanyArchive[] = [
  {
    id: '1',
    title: 'Laporan Keberlanjutan Tahun 2025',
    slug: 'laporan-keberlanjutan-2025',
    description: 'Laporan keberlanjutan PT Gadai Sakti Indonesia tahun 2025.',
    year: 2025,
    documentType: 'Laporan Keberlanjutan',
    fileUrl: '',
    coverImage: '',
    publishedAt: new Date('2026-04-29'),
  },
  {
    id: '2',
    title: 'Laporan Keberlanjutan Tahun 2024',
    slug: 'laporan-keberlanjutan-2024',
    description: 'Dokumen dummy untuk rancangan arsip perusahaan sebelum data dikelola melalui /internal.',
    year: 2024,
    documentType: 'Laporan Keberlanjutan',
    fileUrl: '',
    coverImage: '',
    publishedAt: new Date('2025-04-25'),
  },
  {
    id: '3',
    title: 'Laporan Tahunan 2024',
    slug: 'laporan-tahunan-2024',
    description: 'Dokumen dummy laporan tahunan untuk kebutuhan layout publik.',
    year: 2024,
    documentType: 'Laporan Tahunan',
    fileUrl: '',
    coverImage: '',
    publishedAt: new Date('2025-04-20'),
  },
]
