# Setup `/internal` + MySQL

Panel internal disiapkan di route terpisah:

- `/internal/login` - login administrator.
- `/internal` - dashboard.
- `/internal/artikel` - CRUD artikel.
- `/internal/arsip` - CRUD arsip/laporan perusahaan.
- `/internal/tools` - slot untuk tools internal berikutnya.

## 1. Persiapan server

Siapkan:

1. Node.js sesuai kebutuhan Next.js project.
2. MySQL 8.x atau versi kompatibel yang mendukung InnoDB + utf8mb4.
3. Database dan user MySQL khusus aplikasi. Hindari menggunakan akun `root` dari aplikasi.
4. HTTPS pada production agar cookie session dikirim dengan flag `Secure`.
5. Folder/storage untuk PDF arsip dan gambar artikel, atau object storage. MySQL hanya menyimpan URL dan metadata file, bukan binary PDF besar.

## 2. Install dependency

Dependency baru: `mysql2`.

```bash
npm install
```

Catatan: lock file project asal belum dapat diregenerasi di environment pengerjaan karena akses registry timeout. Jalankan `npm install` sekali di komputer/server Anda agar `package-lock.json` diperbarui dengan dependency MySQL.

## 3. Buat database

Jalankan:

```bash
mysql -u root -p < database/schema.sql
```

Schema membuat tabel:

- `admin_users`
- `admin_sessions`
- `articles`
- `company_archives`

## 4. Environment

Copy `.env.example` menjadi `.env.local` lalu isi bagian MySQL:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=gadai_sakti_app
DB_PASSWORD=PASSWORD_KUAT
DB_NAME=gadai_sakti
DB_CONNECTION_LIMIT=10
INTERNAL_SESSION_DAYS=1
```

Jangan commit `.env.local`.

## 5. Buat admin pertama

Setelah dependency dan environment siap:

```bash
npm run internal:create-admin -- --email=admin@gadaisakti.id --password="PASSWORD_MINIMAL_10_KARAKTER" --name="Administrator" --role=super_admin
```

Role yang tersedia:

- `super_admin`: CRUD termasuk delete.
- `editor`: create/edit/publish; delete dibatasi oleh API.

## 6. Model autentikasi

Autentikasi tidak menggunakan credential di browser/localStorage.

1. Password disimpan sebagai hash `scrypt + random salt`.
2. Setelah login, server membuat random session token.
3. Database hanya menyimpan SHA-256 hash token di `admin_sessions`.
4. Browser menerima token asli melalui cookie `HttpOnly`, `SameSite=Strict`, dan `Secure` pada production.
5. Layout `/internal/(protected)` mengecek session ke MySQL setiap membuka area protected.
6. API `/api/internal/*` juga mengecek session; jadi proteksi bukan hanya pada tampilan.
7. Logout menghapus session di database dan cookie browser.

## 7. Konten publik dan fallback dummy

- `/api/articles` membaca artikel `published` dari MySQL.
- `/api/archives` membaca arsip `published` dari MySQL.
- Selama MySQL belum dikonfigurasi, halaman publik memakai data dummy dari `lib/content/*-seed.ts`.
- Setelah database aktif dan konten dibuat/publish dari `/internal`, data MySQL menjadi sumber utama.

## 8. File arsip

Saat ini panel menerima `fileUrl`. Untuk production, rekomendasi:

- upload PDF ke storage/server yang memang ditujukan untuk file publik;
- validasi MIME `application/pdf` dan ukuran file pada modul upload yang akan dibuat;
- simpan hanya path/URL, ukuran, tipe file, dan metadata lain di MySQL;
- jangan menyimpan PDF besar langsung sebagai BLOB kecuali ada alasan khusus.

## 9. Checklist sebelum production

- Ganti password database dan admin dengan password kuat.
- Gunakan database user dengan privilege seperlunya.
- Pastikan HTTPS aktif.
- Batasi akses `/internal` dengan firewall/VPN/IP allowlist bila kebijakan kantor memungkinkan.
- Tambahkan rate limit login pada reverse proxy (Nginx/Cloudflare) atau service rate limit terpusat.
- Backup database terjadwal.
- Tambahkan audit log sebelum panel dipakai banyak pengguna.
- Tambahkan upload file terkontrol; jangan menerima path file arbitrary dari user eksternal.

## 10. Modul Karir & Psikotes

Untuk project versi ini, jalankan migration tambahan jika database lama sudah dibuat:

```bash
mysql -u USER -p gadai_sakti < database/migrations/002-career-psychotest.sql
```

Opsional untuk data demo:

```bash
mysql -u USER -p gadai_sakti < database/seed-career.sql
```

Route baru:

- `/internal/karir` - lowongan, pelamar, status rekrutmen, undangan psikotes.
- `/internal/psikotes` - paket asesmen, bagian, timer, bank soal, opsi, kunci soal objektif.
- `/karir` - daftar lowongan publik.
- `/karir/[slug]` - detail lowongan.
- `/karir/[slug]/lamar` - formulir lamaran.
- `/karir/psikotes/[token]` - asesmen kandidat melalui token undangan.

Detail teknis ada di `CAREER-PSIKOTEST-SETUP.md`.

Catatan create admin: script sekarang membaca `.env.local` melalui flag Node `--env-file=.env.local` pada command npm, sehingga tidak memerlukan import `@next/env` di `scripts/create-admin.mjs`.
