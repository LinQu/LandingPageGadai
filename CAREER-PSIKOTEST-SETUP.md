# Karir + Psikotes

## Route publik

- `/karir` — daftar lowongan, filter posisi/lokasi/pendidikan, 3 kolom desktop.
- `/karir/[slug]` — detail lowongan dan alur rekrutmen.
- `/karir/[slug]/lamar` — formulir data diri pelamar.
- `/karir/psikotes/[token]` — halaman asesmen kandidat dari tautan undangan HR.

## Route internal

- `/internal/karir` — CRUD lowongan, daftar pelamar, status rekrutmen, catatan HR, dan pembuatan tautan psikotes.
- `/internal/psikotes` — paket psikotes, bagian, timer, bank soal, opsi, dan kunci soal objektif.

## Update database yang sudah pernah menjalankan schema lama

```bash
mysql -u USER -p gadai_sakti < database/migrations/002-career-psychotest.sql
```

Opsional untuk dummy lowongan dan paket demo:

```bash
mysql -u USER -p gadai_sakti < database/seed-career.sql
```

`seed-career.sql` hanya untuk demonstrasi flow. Paket psikotes demo bukan instrumen psikologi tervalidasi.

## Tabel baru

- `job_positions` — master lowongan.
- `job_applications` — data pelamar + status proses.
- `psychotest_sets` — paket asesmen.
- `psychotest_sections` — bagian asesmen dan timer per bagian.
- `psychotest_questions` — pertanyaan, tipe, mode scoring, dan bobot.
- `psychotest_question_options` — pilihan jawaban.
- `psychotest_assignments` — undangan psikotes per pelamar, token hash, expiry, progress, dan skor objektif.
- `psychotest_answers` — jawaban kandidat dan hasil koreksi soal objektif.

## Alur rekrutmen

1. HR membuat dan publish lowongan dari `/internal/karir`.
2. Kandidat membuka `/karir`, melihat detail, lalu mengisi formulir lamaran.
3. Lamaran masuk dengan status `submitted`.
4. HR melakukan review manusia dan mengubah status ke `hr_review` bila diperlukan.
5. Jika kandidat mengikuti asesmen, HR memilih paket psikotes published dan membuat tautan undangan. Tautan dibuat dengan token acak, sedangkan database hanya menyimpan SHA-256 hash token.
6. Kandidat membuka tautan, membaca instruksi, lalu memulai. Timer baru berjalan setelah tombol Mulai Psikotes ditekan.
7. Satu bagian tampil pada satu waktu. Jawaban disimpan ke server saat dipilih/diisi.
8. Kandidat tidak kembali ke bagian sebelumnya setelah menekan Lanjut Bagian. Saat timer habis, sistem bergerak ke bagian berikutnya.
9. Pada submit terakhir, hanya soal dengan `scoring_mode=objective` yang menghasilkan skor benar/salah. Pertanyaan work-style/skala tidak diberi label psikologis otomatis.
10. Status lamaran berubah menjadi `psychotest_completed`. HR tetap melakukan review manusia dan mengubah tahap berikutnya secara manual.

## Alur menyusun paket psikotes

Struktur yang direkomendasikan untuk workflow teknis:

1. **Instruksi umum** — aturan pengerjaan, perangkat, koneksi, dan batas waktu.
2. **Verbal** — pemahaman instruksi dan informasi tertulis.
3. **Numerik** — aritmetika dasar yang relevan dengan kebutuhan pekerjaan.
4. **Logika** — pola atau penalaran objektif.
5. **Situational judgement** — skenario kerja. Jika belum ada kunci tervalidasi, gunakan `Tidak dinilai otomatis`.
6. **Work-style** — skala 1–5 untuk preferensi/cara kerja; sistem menyimpan jawaban tanpa memberi diagnosis atau keputusan otomatis.

Untuk instrumen psikometrik yang benar-benar dipakai sebagai alat seleksi formal, konten, validitas, reliabilitas, norma, dan interpretasi harus disiapkan/ditinjau profesional yang kompeten. Panel ini menyediakan workflow teknis, bukan validasi ilmiah alat tes.

## Cara input soal dari `/internal/psikotes`

1. Buat **Paket Psikotes Baru** sebagai `draft`.
2. Buka editor paket.
3. Tambahkan **Bagian**, isi judul, instruksi, dan durasi menit.
4. Tambahkan soal pada bagian tersebut.
5. Pilih tipe:
   - `Pilihan tunggal`
   - `Pilihan ganda`
   - `Jawaban teks`
   - `Skala 1–5`
6. Untuk pilihan, format opsi satu baris per jawaban:

```text
A | Pilihan pertama
B | Pilihan kedua
C | Pilihan ketiga
D | Pilihan keempat
```

7. Jika soal benar-benar objektif, pilih `Penilaian: Objektif` dan isi kunci `B` atau `A,C` untuk multiple choice.
8. Pertanyaan skala dan jawaban teks otomatis tidak menggunakan scoring objektif.
9. Simpan struktur, cek jumlah bagian/soal, baru ubah paket menjadi `published`.

## Kebijakan keputusan rekrutmen

Sistem sengaja tidak memiliki threshold lulus, auto-reject, auto-hire, atau ranking kandidat berdasarkan psikotes. `raw_score/max_score` hanya ditampilkan sebagai informasi untuk soal objektif. Keputusan rekrutmen dilakukan HR dengan review manusia dan kebijakan perusahaan yang berlaku.

## Data & keamanan yang perlu disiapkan sebelum production

- HTTPS.
- MySQL user khusus aplikasi, bukan root.
- Backup dan retention policy untuk data pelamar.
- Kebijakan privasi/consent rekrutmen yang sesuai kebijakan perusahaan.
- Akses `/internal` dibatasi untuk tim yang membutuhkan.
- Rate limit login internal dan endpoint publik pengiriman lamaran.
- Mekanisme penghapusan/anonimisasi data pelamar sesuai retention perusahaan.
- Jika nanti ada upload CV/dokumen, gunakan storage terkontrol dengan validasi tipe/ukuran; jangan menyimpan file besar sebagai BLOB MySQL.
- Tautan psikotes adalah bearer secret: kirim hanya ke kandidat terkait, gunakan expiry, dan buat ulang jika bocor.
