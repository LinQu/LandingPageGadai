# Perubahan Artikel, Tentang Kami, Arsip, dan Internal

## Public site

- `/artikel`
  - layout baru mengikuti mockup;
  - grid 3 kolom di desktop;
  - pencarian;
  - pagination 9 artikel per halaman;
  - data dummy 9 artikel selama MySQL belum aktif.

- `/artikel/[slug]`
  - breadcrumb;
  - judul besar + hero image;
  - daftar isi;
  - isi artikel per section menggunakan format `## Judul Bagian`;
  - highlight keamanan/proses;
  - FAQ;
  - CTA khusus untuk simulasi gadai dan mencari cabang.

- `/tentang-kami`
  - hero profil perusahaan;
  - ilustrasi outlet;
  - statistik;
  - Mengapa Memilih Kami;
  - perjalanan perusahaan;
  - preview arsip;
  - CTA gadai.

- `/arsip`
  - sekarang menjadi arsip publik perusahaan, bukan riwayat gadai pelanggan;
  - data dummy sementara;
  - siap membaca data `company_archives` dari MySQL.

## Internal

- `/internal/login`
- `/internal`
- `/internal/artikel`
- `/internal/arsip`
- `/internal/tools`

Autentikasi memakai session server + MySQL. Detail setup ada di `INTERNAL-SETUP.md`.

## Database

Schema: `database/schema.sql`.

Tabel awal:

- `admin_users`
- `admin_sessions`
- `articles`
- `company_archives`

## Dependency baru

- `mysql2`

Karena environment pengerjaan tidak dapat mengakses npm registry sampai selesai, lockfile lama tidak disertakan agar tidak terjadi frozen-lock mismatch. Jalankan `npm install` sekali untuk membuat `package-lock.json` baru sebelum deploy.
