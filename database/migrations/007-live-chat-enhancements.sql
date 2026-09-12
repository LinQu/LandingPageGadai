UPDATE live_chat_quick_replies
SET message = 'Barang yang dapat diajukan di Gadai Sakti antara lain:\n\n- Handphone / smartphone\n- Laptop / notebook\n- Televisi\n- Kamera\n- Speaker aktif\n- Home theater\n- Drone\n- Proyektor\n- Sepeda motor\n\nUntuk pengecekan lebih tepat, tuliskan jenis barang, merek, tipe/seri, kapasitas atau varian (jika ada), serta kondisi barang. Untuk pertanyaan nominal taksiran, Admin HO akan menindaklanjuti melalui WhatsApp.',
    keywords = 'barang apa saja, barang yang bisa, bisa digadai, bisa digadaikan, barang gadai, jenis barang, gadai apa aja, menerima apa saja, handphone, hp, hape, smartphone, iphone, android, laptop, notebook, macbook, televisi, tv, kamera, camera, speaker, speaker aktif, home theater, hometheater, drone, proyektor, projector, motor, sepeda motor, elektronik',
    priority = 600, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Barang apa saja yang bisa digadaikan di Gadai Sakti?';

UPDATE live_chat_quick_replies
SET message = 'Syarat pengajuan barang elektronik:\n\n1. Identitas diri yang masih berlaku.\n2. Barang elektronik yang akan digadaikan.\n3. Bawa kelengkapan yang tersedia, seperti charger/adaptor, dus, kabel, remote, atau aksesori bawaan.\n\nBarang yang tidak lengkap tetap dapat diajukan, tetapi kelengkapan menjadi salah satu faktor penilaian. Saat datang ke cabang, bawa seluruh kelengkapan yang masih tersedia.',
    keywords = 'syarat elektronik, syarat gadai elektronik, persyaratan elektronik, mau gadai hp, gadai hp, gadai hape, gadai handphone, gadai smartphone, gadai iphone, gadai android, mau gadai laptop, gadai laptop, gadai notebook, gadai macbook, gadai tv, gadai televisi, gadai kamera, gadai camera, gadai speaker, gadai home theater, gadai drone, gadai proyektor, charger, adaptor, dus, box, kabel, remote, aksesori, ktp, identitas',
    priority = 590, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apa saja syarat untuk menggadaikan barang elektronik?';

UPDATE live_chat_quick_replies
SET message = 'Syarat pengajuan gadai motor:\n\n1. Unit sepeda motor.\n2. Kunci motor.\n3. STNK asli.\n4. BPKB asli.\n5. Identitas diri.\n\nUnit dan dokumen akan diperiksa terlebih dahulu di cabang sesuai ketentuan Gadai Sakti.',
    keywords = 'syarat motor, syarat gadai motor, persyaratan motor, mau gadai motor, gadai motor, motor bisa digadai, sepeda motor, unit motor, stnk, bpkb, kunci motor, dokumen motor, surat motor',
    priority = 580, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apa saja syarat untuk menggadaikan motor?';

UPDATE live_chat_quick_replies
SET message = 'Untuk saat ini, Gadai Sakti belum dapat memproses gadai BPKB saja tanpa unit motor.\n\nPengajuan gadai motor dilakukan dengan membawa unit motor beserta dokumen yang dipersyaratkan, termasuk STNK asli, BPKB asli, kunci, dan identitas diri.',
    keywords = 'bpkb saja, gadai bpkb saja, hanya bpkb, bpkb doang, tanpa unit, tanpa unit motor, tanpa motor, gadai bpkb, jaminan bpkb, pinjam bpkb',
    priority = 570, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apakah bisa menggadaikan BPKB saja tanpa unit motor?';

UPDATE live_chat_quick_replies
SET message = 'Masih dapat diajukan, Kak.\n\nKelengkapan barang merupakan salah satu faktor dalam penilaian. Jika dus, charger, adaptor, kabel, remote, atau aksesori tidak lengkap, tetap bawa barang beserta kelengkapan yang masih tersedia agar petugas cabang dapat melakukan pengecekan.',
    keywords = 'barang tidak lengkap, tidak lengkap, kurang lengkap, tanpa dus, tanpa box, dus hilang, box hilang, tanpa charger, charger hilang, tanpa adaptor, adaptor hilang, kabel hilang, remote hilang, aksesori tidak lengkap, kelengkapan barang',
    priority = 560, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Barang saya tidak lengkap, apakah masih bisa digadaikan?';

UPDATE live_chat_quick_replies
SET message = 'Alur gadai di Gadai Sakti:\n\n1. Datang ke cabang membawa barang dan identitas.\n2. Barang diperiksa dan ditaksir.\n3. Jika nominal disetujui, pengajuan gadai diproses.\n4. Dana dicairkan.\n5. Masa gadai 30 hari sejak tanggal transaksi.\n\nKetentuan biaya pada dokumen FAQ: tarif sewa 10% + biaya admin 1% dari pinjaman. Setelah jatuh tempo terdapat masa toleransi maksimal 15 hari sebelum barang masuk proses lelang apabila tidak dilunasi atau diperpanjang.',
    keywords = 'proses gadai, alur gadai, cara gadai, cara menggadaikan, bagaimana gadai, gimana gadai, sistem gadai, prosedur gadai, langkah gadai, tahap gadai, tenor gadai, biaya gadai, sewa, sewa modal, admin gadai, jatuh tempo, prosesnya bagaimana',
    priority = 550, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana proses gadai di Gadai Sakti?';

UPDATE live_chat_quick_replies
SET message = 'Proses pengecekan barang hingga pencairan umumnya sekitar 15-30 menit.\n\nWaktu dapat menyesuaikan jenis barang, kondisi barang, kelengkapan, dan proses verifikasi di cabang.',
    keywords = 'berapa lama proses, lama proses, proses berapa menit, berapa menit, cepat tidak, cepat ga, kapan cair, dana cair berapa lama, lama pencairan, proses pencairan, pencairan berapa lama, 15 menit, 30 menit',
    priority = 540, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Berapa lama proses gadai sampai dana cair?';

UPDATE live_chat_quick_replies
SET message = 'Pencairan dana dapat dilakukan secara tunai atau transfer sesuai layanan yang tersedia di Gadai Sakti.\n\nUntuk pencairan melalui transfer:\n- Pemilik/penjamin harus sesuai ketentuan transaksi.\n- Rekening digunakan sesuai data yang dipersyaratkan.\n- Rekening selain Bank BCA dapat dikenakan biaya administrasi sesuai bank terkait.',
    keywords = 'pencairan dana, dana dicairkan, cara cair, cair tunai, cair transfer, tunai, transfer, rekening, rekening bca, bank bca, bank lain, biaya transfer, pencairan ke rekening, uang diterima',
    priority = 530, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana dana gadai dapat dicairkan?';

UPDATE live_chat_quick_replies
SET message = 'Masa gadai adalah 30 hari sejak tanggal transaksi.\n\nSebelum atau saat jatuh tempo, Kakak dapat melakukan pelunasan atau perpanjangan sesuai ketentuan yang berlaku.',
    keywords = 'masa gadai, berapa lama masa gadai, tenor, tenor 30 hari, 30 hari, jatuh tempo, kapan jatuh tempo, tanggal jatuh tempo, berapa hari gadai, waktu gadai',
    priority = 520, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Berapa lama masa gadai?';

UPDATE live_chat_quick_replies
SET message = 'Jika belum dapat melunasi saat jatuh tempo, gadai dapat diperpanjang sesuai ketentuan Gadai Sakti dengan membayar biaya perpanjangan yang berlaku.\n\nPerpanjangan dapat dilakukan maksimal 3 kali untuk setiap barang.',
    keywords = 'belum bisa lunas, belum bisa melunasi, belum lunas, tidak bisa lunas, jatuh tempo belum lunas, mau perpanjang, perpanjang gadai, perpanjangan, extend gadai, tambah waktu, belum ada uang',
    priority = 510, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana jika belum bisa melunasi saat jatuh tempo?';

UPDATE live_chat_quick_replies
SET message = 'Perpanjangan gadai dapat dilakukan maksimal 3 kali untuk setiap barang, sesuai ketentuan yang berlaku.',
    keywords = 'berapa kali perpanjang, berapa kali diperpanjang, maksimal perpanjangan, batas perpanjangan, perpanjang berapa kali, 3 kali, tiga kali, extend berapa kali',
    priority = 500, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Berapa kali gadai dapat diperpanjang?';

UPDATE live_chat_quick_replies
SET message = 'Ada denda keterlambatan apabila melewati tanggal jatuh tempo.\n\nBesaran denda pada dokumen FAQ adalah 0,35% per hari dari nilai pinjaman, dengan masa toleransi maksimal 15 hari setelah jatuh tempo. Setelah periode tersebut, barang dapat masuk proses lelang sesuai ketentuan.',
    keywords = 'denda, denda terlambat, denda keterlambatan, terlambat bayar, telat bayar, terlambat perpanjang, telat perpanjang, lewat jatuh tempo, 0 35 persen, denda per hari, masa toleransi, toleransi 15 hari',
    priority = 490, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apakah ada denda jika terlambat melakukan perpanjangan?';

UPDATE live_chat_quick_replies
SET message = 'Jika barang tidak dilunasi atau tidak diperpanjang sampai melewati jatuh tempo dan masa toleransi yang berlaku, barang dapat masuk ke proses lelang sesuai ketentuan Gadai Sakti.',
    keywords = 'tidak dilunasi, tidak lunas, tidak diperpanjang, tidak perpanjang, lewat jatuh tempo, barang dilelang, masuk lelang, proses lelang, telat 15 hari, gagal tebus, tidak ditebus',
    priority = 480, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apa yang terjadi jika barang tidak dilunasi atau tidak diperpanjang?';

UPDATE live_chat_quick_replies
SET message = 'Untuk menebus atau melunasi barang gadai, lakukan pelunasan sesuai ketentuan transaksi pada cabang Gadai Sakti.\n\nSiapkan Surat Bukti Gadai dan identitas yang diperlukan. Setelah pembayaran dan verifikasi selesai, barang jaminan dapat diambil kembali.',
    keywords = 'cara tebus, tebus barang, tebus gadai, menebus barang, pelunasan, cara pelunasan, lunasi gadai, melunasi barang, ambil barang, ambil jaminan, pengambilan barang, bukti gadai',
    priority = 470, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana cara menebus atau melunasi barang gadai?';

UPDATE live_chat_quick_replies
SET message = 'Pelunasan dapat diwakilkan. Pihak yang mewakili perlu membawa:\n\n- Surat Bukti Gadai asli.\n- Identitas asli nasabah.\n- Identitas asli pihak yang mewakili.\n- Surat kuasa yang telah diisi dan ditandatangani sesuai ketentuan.',
    keywords = 'pelunasan diwakilkan, bisa diwakilkan, boleh diwakilkan, wakil pelunasan, orang lain menebus, orang lain ambil barang, surat kuasa, pakai surat kuasa, diwakili, wakil tebus',
    priority = 460, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apakah pelunasan bisa diwakilkan?';

UPDATE live_chat_quick_replies
SET message = 'Pembayaran dapat dilakukan melalui transfer bank atau tunai di cabang sesuai jenis transaksi dan ketentuan yang berlaku.\n\nJika melakukan transfer, simpan bukti transfer dan pastikan nama/data transaksi sesuai agar proses verifikasi lebih mudah.',
    keywords = 'cara pembayaran, pembayaran, cara bayar, bayar, bayar transfer, transfer pembayaran, bayar tunai, tunai di cabang, bukti transfer, nomor rekening, rekening pembayaran, metode pembayaran',
    priority = 450, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana cara melakukan pembayaran?';

UPDATE live_chat_quick_replies
SET message = 'Tentu, Kak. Kami bisa membantu mencarikan cabang Gadai Sakti yang sesuai domisili.\n\nSilakan isi:\nKota/Kabupaten =\nKecamatan =\nKelurahan =\n\nKakak juga dapat memilih tombol "Gunakan lokasi saya saat ini" agar sistem menghitung cabang terdekat berdasarkan lokasi perangkat. Setelah lokasi ditemukan, Live Chat akan menampilkan nama cabang, alamat, jarak (jika lokasi perangkat diizinkan), petunjuk arah, dan tombol Chat Cabang.',
    keywords = 'cabang terdekat, cabang dekat, cabang paling dekat, lokasi cabang, lokasi gadai sakti, alamat cabang, alamat gadai sakti, outlet, outlet terdekat, kantor gadai sakti, cabang dimana, cabang di mana, cari cabang, ada cabang, cabang daerah, cabang kota, dekat sini, sekitar saya, daerah saya, lokasi saya, cabang lampung, cabang jakarta, cabang semarang, cabang tegal, cabang brebes, cabang salatiga, petunjuk arah, maps cabang',
    priority = 440, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Di mana cabang Gadai Sakti terdekat dari lokasi saya?';

UPDATE live_chat_quick_replies
SET message = 'Jam operasional umum Gadai Sakti:\n\nSenin-Jumat : 08.30-21.00 WIB\nSabtu       : 08.30-20.00 WIB\nMinggu      : cabang tetap buka\n\nJam layanan dapat berbeda pada cabang tertentu. Jika Kakak menyebutkan kota/domisisili, kami dapat membantu menampilkan cabang yang sesuai.',
    keywords = 'jam buka, buka jam berapa, jam operasional, jam kerja, jam layanan, hari minggu buka, minggu buka, hari sabtu buka, sabtu buka, senin jumat, buka hari ini, tutup jam berapa, sampai jam berapa, cabang buka',
    priority = 430, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Jam berapa cabang Gadai Sakti buka?';

UPDATE live_chat_quick_replies
SET message = 'Untuk saat ini, barang lelang Gadai Sakti tidak ditawarkan untuk penjualan langsung kepada masyarakat umum.',
    keywords = 'barang lelang, jual barang lelang, beli barang lelang, mau beli lelang, lelang masyarakat, lelang umum, barang bekas lelang, hp lelang, motor lelang, elektronik lelang, hasil lelang',
    priority = 420, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Apakah Gadai Sakti menjual barang lelang kepada masyarakat umum?';

UPDATE live_chat_quick_replies
SET message = 'Untuk informasi lowongan pekerjaan Gadai Sakti, silakan lanjutkan melalui Tim HR. Live Chat akan menampilkan tombol WhatsApp Tim HR agar Kakak dapat menanyakan posisi, penempatan, dan proses rekrutmen yang tersedia.',
    keywords = 'lowongan, lowongan kerja, loker, karir, career, kerja, pekerjaan, cari kerja, mau kerja, melamar, lamaran, daftar kerja, rekrutmen, recruitment, hrd, hr, posisi kerja, vacancy',
    priority = 410, auto_send = 1, active = 1, customer_visible = 1
WHERE title = 'Bagaimana cara melihat lowongan kerja di Gadai Sakti?';

-- Shortcut tersembunyi untuk pertanyaan bebas. Tidak ditampilkan sebagai tombol FAQ,
-- tetapi membantu auto reply dan saran balasan Admin HO berdasarkan keyword.
UPDATE live_chat_quick_replies
SET category = 'Barang & Syarat Gadai',
    message = 'Bisa, Kak. Handphone/smartphone dapat diajukan untuk gadai di Gadai Sakti.\n\nAgar pengecekan lebih mudah, informasikan merek, tipe/seri, kapasitas/varian, kondisi, dan kelengkapan yang tersedia. Untuk nominal taksiran, Admin HO akan menghubungi Kakak melalui WhatsApp.',
    keywords = 'hp, hape, handphone, smartphone, iphone, android, samsung, oppo, vivo, xiaomi, realme, infinix, ipad, gadai hp, gadai hape, gadai handphone, hp bisa digadai, iphone bisa digadai, handphone bagaimana, hp bagaimana',
    priority = 760, auto_send = 1, active = 1, customer_visible = 0
WHERE title = 'Gadai Handphone';

UPDATE live_chat_quick_replies
SET category = 'Barang & Syarat Gadai',
    message = 'Bisa, Kak. Laptop/notebook dapat diajukan untuk gadai di Gadai Sakti.\n\nAgar pengecekan lebih mudah, informasikan merek, tipe/seri, spesifikasi utama jika diketahui, kondisi, dan kelengkapan seperti charger/adaptor. Untuk nominal taksiran, Admin HO akan menghubungi Kakak melalui WhatsApp.',
    keywords = 'laptop, leptop, labtop, notebook, macbook, chromebook, asus, acer, lenovo, hp laptop, dell, msi, gadai laptop, laptop bisa digadai, mau gadai laptop, laptop bagaimana, kalo laptop, kalau laptop',
    priority = 770, auto_send = 1, active = 1, customer_visible = 0
WHERE title = 'Gadai Laptop';

UPDATE live_chat_quick_replies
SET category = 'Barang & Syarat Gadai',
    message = 'Untuk gadai motor, Kakak perlu membawa unit motor, kunci, STNK asli, BPKB asli, dan identitas diri. Unit serta dokumen akan diperiksa di cabang.\n\nGadai BPKB saja tanpa membawa unit motor belum dapat diproses.',
    keywords = 'motor, sepeda motor, gadai motor, mau gadai motor, motor bisa digadai, bpkb, stnk, gadai bpkb, motor bagaimana, gadai kendaraan, kendaraan roda dua',
    priority = 780, auto_send = 1, active = 1, customer_visible = 0
WHERE title = 'Gadai Motor / BPKB';

UPDATE live_chat_quick_replies
SET category = 'Lokasi & Kunjungan Cabang',
    message = 'Tentu, Kak. Untuk mencarikan cabang Gadai Sakti yang sesuai, silakan isi:\n\nKota/Kabupaten =\nKecamatan =\nKelurahan =\n\nAtau gunakan tombol lokasi perangkat pada Live Chat agar cabang dapat diurutkan berdasarkan jarak terdekat.',
    keywords = 'cabang, lokasi, outlet, alamat gadai sakti, cabang terdekat, cabang dekat, cabang dimana, cabang di mana, cari cabang, ada cabang, dekat sini, sekitar saya, lokasi saya, kantor gadai, petunjuk arah',
    priority = 790, auto_send = 1, active = 1, customer_visible = 0
WHERE title = 'Lokasi Cabang';

-- Jika shortcut lama tidak ada pada database tertentu, buat versi tersembunyi secara idempotent.
INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Elektronik Lainnya', 'Barang & Syarat Gadai', 'Bisa diajukan, Kak. Untuk TV, kamera, speaker aktif, home theater, drone, atau proyektor, informasikan jenis barang, merek, tipe/seri, kondisi, serta kelengkapan yang tersedia. Petugas cabang akan melakukan pengecekan sebelum menentukan hasil penilaian.', 'tv, televisi, kamera, camera, speaker, speaker aktif, home theater, hometheater, drone, proyektor, projector, elektronik lainnya, gadai tv, gadai kamera, gadai speaker, gadai drone, gadai proyektor', 750, 1, 1, 0
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Elektronik Lainnya' LIMIT 1);
