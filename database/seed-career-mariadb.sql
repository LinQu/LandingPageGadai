USE gadai_sakti;

-- Seed career + psychotest demo, compatible with MySQL/MariaDB.
-- Safe to run repeatedly: rows are inserted only when the logical key does not exist.

-- Dummy lowongan untuk menguji layout publik. Hapus/ganti dari /internal/karir saat data real sudah siap.
INSERT INTO job_positions (
  title, slug, summary, description, responsibilities, qualifications, benefits,
  location_city, location_province, employment_type, work_mode, experience_level,
  education, salary_min, salary_max, published_at, status
)
SELECT
  'Kepala Outlet Cabang',
  'kepala-outlet-cabang-semarang',
  'Mengelola tim outlet untuk mencapai target, memastikan operasional efektif, dan menjaga kualitas pelayanan.',
  'Mengelola tim outlet untuk mencapai target penjualan cabang, memberikan pelatihan dan pengembangan tim, serta memastikan operasional outlet berjalan sesuai SOP perusahaan.',
  'Memimpin dan mengelola tim outlet dalam mencapai target yang ditetapkan\nMengawasi operasional harian outlet sesuai SOP perusahaan\nMelakukan pelayanan terbaik kepada nasabah\nMembuat laporan penjualan dan kinerja tim secara berkala\nMenjaga keamanan dan aset perusahaan di outlet\nMelakukan pembinaan dan pengembangan anggota tim',
  'Pendidikan minimal SMA/SMK sederajat\nTerbuka untuk fresh graduate\nMemiliki kemampuan komunikasi yang baik\nMampu bekerja dalam tim dan target oriented\nBersedia ditempatkan di seluruh area penempatan\nBerpenampilan menarik dan rapi',
  'Gaji Kompetitif\nJenjang Karier\nBonus & Insentif\nPelatihan & Pengembangan\nBPJS Kesehatan & Ketenagakerjaan\nTunjangan Transportasi',
  'Semarang', 'Jawa Tengah', 'Full Time', 'On Site',
  'Tanpa Pengalaman / Fresh Graduate', 'SMA/SMK',
  3000000, 5000000, NOW(), 'published'
FROM (SELECT 1 AS seed) AS s
WHERE NOT EXISTS (
  SELECT 1 FROM job_positions WHERE slug = 'kepala-outlet-cabang-semarang'
);

INSERT INTO job_positions (
  title, slug, summary, description, responsibilities, qualifications, benefits,
  location_city, location_province, employment_type, work_mode, experience_level,
  education, salary_min, salary_max, published_at, status
)
SELECT
  'Customer Service Outlet',
  'customer-service-outlet-jakarta-barat',
  'Melayani informasi nasabah dan membantu proses administrasi transaksi di outlet.',
  'Menjadi titik layanan awal nasabah, memastikan informasi transaksi disampaikan dengan jelas, dan mendukung administrasi outlet.',
  'Melayani kebutuhan informasi nasabah\nMembantu administrasi transaksi\nMenjaga kerapian dokumen\nBerkoordinasi dengan tim outlet',
  'Pendidikan minimal SMA/SMK\nKomunikatif dan teliti\nTerbuka untuk fresh graduate',
  'Gaji kompetitif\nJenjang karier\nPelatihan\nBPJS',
  'Jakarta Barat', 'DKI Jakarta', 'Full Time', 'On Site',
  'Fresh Graduate', 'SMA/SMK',
  3000000, 5000000, NOW(), 'published'
FROM (SELECT 1 AS seed) AS s
WHERE NOT EXISTS (
  SELECT 1 FROM job_positions WHERE slug = 'customer-service-outlet-jakarta-barat'
);

-- Paket demo hanya untuk menguji alur sistem, bukan instrumen psikologi tervalidasi.
INSERT INTO psychotest_sets (name, description, instructions, status)
SELECT
  'Psikotes Dasar Operasional - Demo',
  'Paket contoh untuk menguji timer, penyimpanan jawaban, perpindahan bagian, dan hasil soal objektif.',
  'Kerjakan secara mandiri. Setiap bagian memiliki waktu tersendiri. Setelah berpindah bagian, jawaban sebelumnya tidak dapat diubah. Paket ini hanya demo teknis dan bukan alat diagnosis atau keputusan rekrutmen otomatis.',
  'published'
FROM (SELECT 1 AS seed) AS s
WHERE NOT EXISTS (
  SELECT 1 FROM psychotest_sets WHERE name = 'Psikotes Dasar Operasional - Demo'
);

SET @test_id = (
  SELECT id
  FROM psychotest_sets
  WHERE name = 'Psikotes Dasar Operasional - Demo'
  ORDER BY id ASC
  LIMIT 1
);

INSERT INTO psychotest_sections (test_set_id, title, instructions, duration_minutes, section_order)
SELECT @test_id, 'Numerik Dasar', 'Pilih jawaban yang paling tepat. Gunakan perhitungan sederhana.', 8, 1
FROM (SELECT 1 AS seed) AS s
WHERE @test_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_sections WHERE test_set_id = @test_id AND section_order = 1
  );

INSERT INTO psychotest_sections (test_set_id, title, instructions, duration_minutes, section_order)
SELECT @test_id, 'Logika Verbal', 'Pilih kesimpulan yang paling sesuai dengan informasi pada soal.', 8, 2
FROM (SELECT 1 AS seed) AS s
WHERE @test_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_sections WHERE test_set_id = @test_id AND section_order = 2
  );

INSERT INTO psychotest_sections (test_set_id, title, instructions, duration_minutes, section_order)
SELECT @test_id, 'Work-style', 'Nilai seberapa sesuai pernyataan dengan cara kerja Anda. 1 = sangat tidak sesuai, 5 = sangat sesuai.', 6, 3
FROM (SELECT 1 AS seed) AS s
WHERE @test_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_sections WHERE test_set_id = @test_id AND section_order = 3
  );

SET @section_num = (
  SELECT id FROM psychotest_sections
  WHERE test_set_id = @test_id AND section_order = 1
  LIMIT 1
);
SET @section_verbal = (
  SELECT id FROM psychotest_sections
  WHERE test_set_id = @test_id AND section_order = 2
  LIMIT 1
);
SET @section_style = (
  SELECT id FROM psychotest_sections
  WHERE test_set_id = @test_id AND section_order = 3
  LIMIT 1
);

INSERT INTO psychotest_questions (
  section_id, question_text, question_type, scoring_mode,
  answer_key_json, weight, is_required, question_order
)
SELECT
  @section_num,
  'Sebuah outlet memproses 120 transaksi dalam 6 hari kerja dengan jumlah transaksi yang sama setiap hari. Berapa rata-rata transaksi per hari?',
  'single_choice', 'objective', '"B"', 1, 1, 1
FROM (SELECT 1 AS seed) AS s
WHERE @section_num IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_questions WHERE section_id = @section_num AND question_order = 1
  );

SET @q1 = (
  SELECT id FROM psychotest_questions
  WHERE section_id = @section_num AND question_order = 1
  LIMIT 1
);

INSERT IGNORE INTO psychotest_question_options (question_id, option_key, option_text, display_order) VALUES
(@q1, 'A', '15', 1),
(@q1, 'B', '20', 2),
(@q1, 'C', '24', 3),
(@q1, 'D', '30', 4);

INSERT INTO psychotest_questions (
  section_id, question_text, question_type, scoring_mode,
  answer_key_json, weight, is_required, question_order
)
SELECT
  @section_num,
  'Target meningkat dari 200 menjadi 230 transaksi. Berapa persentase kenaikannya?',
  'single_choice', 'objective', '"C"', 1, 1, 2
FROM (SELECT 1 AS seed) AS s
WHERE @section_num IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_questions WHERE section_id = @section_num AND question_order = 2
  );

SET @q2 = (
  SELECT id FROM psychotest_questions
  WHERE section_id = @section_num AND question_order = 2
  LIMIT 1
);

INSERT IGNORE INTO psychotest_question_options (question_id, option_key, option_text, display_order) VALUES
(@q2, 'A', '10%', 1),
(@q2, 'B', '12%', 2),
(@q2, 'C', '15%', 3),
(@q2, 'D', '20%', 4);

INSERT INTO psychotest_questions (
  section_id, question_text, question_type, scoring_mode,
  answer_key_json, weight, is_required, question_order
)
SELECT
  @section_verbal,
  'Semua transaksi harus dicatat. Transaksi A belum tercatat. Kesimpulan yang paling tepat adalah ...',
  'single_choice', 'objective', '"A"', 1, 1, 1
FROM (SELECT 1 AS seed) AS s
WHERE @section_verbal IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_questions WHERE section_id = @section_verbal AND question_order = 1
  );

SET @q3 = (
  SELECT id FROM psychotest_questions
  WHERE section_id = @section_verbal AND question_order = 1
  LIMIT 1
);

INSERT IGNORE INTO psychotest_question_options (question_id, option_key, option_text, display_order) VALUES
(@q3, 'A', 'Transaksi A perlu dicatat sebelum proses administrasi dinyatakan lengkap.', 1),
(@q3, 'B', 'Transaksi A boleh diabaikan.', 2),
(@q3, 'C', 'Semua transaksi lain pasti salah.', 3),
(@q3, 'D', 'Tidak ada informasi yang dapat digunakan.', 4);

INSERT INTO psychotest_questions (
  section_id, question_text, question_type, scoring_mode,
  answer_key_json, weight, is_required, question_order
)
SELECT
  @section_style,
  'Saya memeriksa kembali pekerjaan sebelum menyerahkannya.',
  'scale_1_5', 'none', NULL, 1, 1, 1
FROM (SELECT 1 AS seed) AS s
WHERE @section_style IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_questions WHERE section_id = @section_style AND question_order = 1
  );

INSERT INTO psychotest_questions (
  section_id, question_text, question_type, scoring_mode,
  answer_key_json, weight, is_required, question_order
)
SELECT
  @section_style,
  'Saya nyaman meminta klarifikasi ketika instruksi kerja belum jelas.',
  'scale_1_5', 'none', NULL, 1, 1, 2
FROM (SELECT 1 AS seed) AS s
WHERE @section_style IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM psychotest_questions WHERE section_id = @section_style AND question_order = 2
  );

-- Ringkasan supaya mudah memastikan seed berhasil.
SELECT 'job_positions' AS entity, COUNT(*) AS total FROM job_positions
UNION ALL
SELECT 'psychotest_sets', COUNT(*) FROM psychotest_sets
UNION ALL
SELECT 'psychotest_sections', COUNT(*) FROM psychotest_sections
UNION ALL
SELECT 'psychotest_questions', COUNT(*) FROM psychotest_questions
UNION ALL
SELECT 'psychotest_question_options', COUNT(*) FROM psychotest_question_options;
