import type { CareerJob } from '@/lib/types'

const baseResponsibilities = [
  'Menjalankan operasional sesuai SOP dan target layanan perusahaan.',
  'Memberikan pelayanan yang profesional dan informatif kepada nasabah.',
  'Membuat laporan pekerjaan dan berkoordinasi dengan atasan secara berkala.',
  'Menjaga keamanan aset, dokumen, dan lingkungan kerja.',
]

const baseQualifications = [
  'Memiliki komunikasi yang baik dan mampu bekerja dalam tim.',
  'Disiplin, teliti, bertanggung jawab, dan terbuka untuk belajar.',
  'Bersedia ditempatkan sesuai kebutuhan area rekrutmen.',
]

const baseBenefits = ['Gaji kompetitif', 'Jenjang karier', 'Bonus & insentif', 'Pelatihan & pengembangan', 'BPJS Kesehatan & Ketenagakerjaan']

function job(
  id: number,
  title: string,
  city: string,
  province: string,
  education: string,
  experience: string,
  summary: string,
  placementDetail?: string
): CareerJob {
  return {
    id: String(id),
    title,
    slug: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${city.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    summary,
    description: `${summary} Posisi ini bekerja bersama tim operasional Gadai Sakti untuk menjaga kualitas layanan, kepatuhan proses, dan pengalaman nasabah di area penempatan.`,
    responsibilities: title.includes('Kepala') ? [
      'Memimpin dan mengelola tim outlet dalam mencapai target yang ditetapkan.',
      'Mengawasi operasional harian outlet sesuai SOP perusahaan.',
      'Melakukan pelayanan terbaik kepada nasabah.',
      'Membuat laporan penjualan dan kinerja tim secara berkala.',
      'Menjaga keamanan dan aset perusahaan di outlet.',
      'Melakukan pembinaan dan pengembangan anggota tim.',
    ] : baseResponsibilities,
    qualifications: [education === 'SMA/SMK' ? 'Pendidikan minimal SMA/SMK sederajat.' : `Pendidikan minimal ${education}.`, experience === 'Fresh Graduate' ? 'Terbuka untuk fresh graduate.' : `Pengalaman: ${experience}.`, ...baseQualifications],
    benefits: baseBenefits,
    locationCity: city,
    locationProvince: province,
    placementDetail: placementDetail || null,
    employmentType: 'Full Time',
    workMode: 'On Site',
    experienceLevel: experience,
    education,
    salaryMin: 3000000,
    salaryMax: 5000000,
    applicationDeadline: null,
    publishedAt: new Date('2026-08-01'),
    status: 'published',
  }
}

export const careerSeed: CareerJob[] = [
  job(1, 'Kepala Outlet Cabang', 'Semarang', 'Jawa Tengah', 'SMA/SMK', 'Tanpa Pengalaman / Fresh Graduate', 'Mengelola tim outlet untuk mencapai target, memastikan operasional efektif, dan menjaga kualitas pelayanan.', 'Sudirman'),
  job(2, 'Penaksir Barang Elektronik', 'Jakarta Barat', 'DKI Jakarta', 'SMA/SMK', '1 tahun', 'Melakukan pemeriksaan awal kondisi barang elektronik dan mendukung proses taksiran sesuai SOP.', 'Slipi'),
  job(3, 'Customer Service Outlet', 'Bekasi', 'Jawa Barat', 'SMA/SMK', 'Fresh Graduate', 'Melayani kebutuhan informasi nasabah dan membantu proses administrasi transaksi di outlet.', 'Juanda'),
  job(4, 'Admin Outlet', 'Tangerang', 'Banten', 'SMA/SMK', 'Fresh Graduate', 'Mengelola administrasi outlet, dokumen transaksi, dan pencatatan operasional harian.', 'Cikokol'),
  job(5, 'Kepala Outlet Cabang', 'Yogyakarta', 'D.I. Yogyakarta', 'SMA/SMK', '1-2 tahun', 'Mengelola tim outlet dan menjaga pencapaian target layanan serta operasional cabang.', 'Malioboro'),
  job(6, 'Marketing Area', 'Surabaya', 'Jawa Timur', 'D3/S1', '1 tahun', 'Menjalankan aktivitas pemasaran area untuk meningkatkan awareness dan kunjungan outlet.', 'Rungkut'),
  job(7, 'Customer Service Outlet', 'Bandung', 'Jawa Barat', 'SMA/SMK', 'Fresh Graduate', 'Memberikan pelayanan informasi yang ramah, akurat, dan sesuai prosedur perusahaan.', 'Dago'),
  job(8, 'Admin Outlet', 'Kab. Tegal', 'Jawa Tengah', 'SMA/SMK', 'Fresh Graduate', 'Menangani administrasi outlet dan memastikan kelengkapan dokumen operasional.', 'Mejasem Barat'),
  job(9, 'Kepala Outlet Cabang', 'Makassar', 'Sulawesi Selatan', 'SMA/SMK', '1-2 tahun', 'Memimpin operasional cabang, pembinaan tim, dan pencapaian target layanan.', 'Panakkukang'),
  job(10, 'Penaksir Barang Elektronik', 'Depok', 'Jawa Barat', 'SMA/SMK', '1 tahun', 'Melakukan pemeriksaan barang dan mendukung proses taksiran yang akurat sesuai prosedur.', 'Margonda'),
  job(11, 'Marketing Area', 'Semarang', 'Jawa Tengah', 'D3/S1', 'Fresh Graduate', 'Mendukung program pemasaran lokal dan aktivitas akuisisi nasabah secara terukur.', 'Banyumanik'),
  job(12, 'Customer Service Outlet', 'Tangerang Selatan', 'Banten', 'SMA/SMK', 'Fresh Graduate', 'Menangani pertanyaan nasabah, administrasi ringan, dan dukungan layanan cabang.', 'BSD Serpong'),
]
