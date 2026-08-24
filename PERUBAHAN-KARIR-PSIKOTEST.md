# Perubahan Karir + Psikotes

## Publik

- `/karir`: hero mengikuti mockup, filter posisi/lokasi/pendidikan, kartu 3 kolom, pagination.
- `/karir/[slug]`: detail lowongan, informasi posisi, benefit, proses rekrutmen, CTA lamar.
- `/karir/[slug]/lamar`: formulir data diri sesuai mockup.
- `/karir/psikotes/[token]`: asesmen kandidat berbasis token undangan, timer per bagian, autosave jawaban, perpindahan bagian terarah.

## Internal

- `/internal/karir`: CRUD lowongan, daftar pelamar, status proses, catatan HR, undangan psikotes.
- `/internal/psikotes`: paket asesmen, bagian, durasi, tipe soal, opsi, dan kunci soal objektif.
- Dashboard internal ditambah statistik lowongan, pelamar, dan paket psikotes.

## Database

Tambahan tabel:

- `job_positions`
- `job_applications`
- `psychotest_sets`
- `psychotest_sections`
- `psychotest_questions`
- `psychotest_question_options`
- `psychotest_assignments`
- `psychotest_answers`

Untuk DB yang sudah ada jalankan `database/migrations/002-career-psychotest.sql`.
Data demo opsional ada di `database/seed-career.sql`.

## Keputusan rekrutmen

Sistem tidak melakukan auto-pass, auto-reject, atau ranking kandidat. Skor hanya dihitung untuk soal objektif yang memiliki kunci jawaban dan ditampilkan sebagai informasi pendukung bagi HR. Tahap rekrutmen tetap diubah manual oleh HR.

## Perbaikan create-admin

`npm run internal:create-admin` sekarang menggunakan `node --env-file=.env.local`, sehingga script dapat membaca konfigurasi MySQL tanpa perlu import `@next/env`.
