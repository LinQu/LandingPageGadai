UPDATE live_chat_quick_replies SET active = 0, auto_send = 0, customer_visible = 0 WHERE title IN ('Syarat Gadai','Gadai Handphone','Gadai Laptop','Gadai Motor / BPKB','Lokasi Cabang','Estimasi Pencairan');

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Barang apa saja yang bisa digadaikan di Gadai Sakti?', 'Barang & Syarat Gadai', 'Gadai Sakti menerima beberapa jenis barang elektronik dan kendaraan, seperti:
- HP
- Laptop
- TV
- Kamera
- Speaker Aktif
- Home Theater
- Drone
- Proyektor
- Sepeda Motor

Jika Kakak ingin memastikan barang tertentu bisa digadai, informasikan jenis, merk, dan tipenya ya.', 'barang apa saja, bisa digadaikan, jenis barang, barang gadai, barang yang bisa', 600, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Barang apa saja yang bisa digadaikan di Gadai Sakti?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apa saja syarat untuk menggadaikan barang elektronik?', 'Barang & Syarat Gadai', 'Untuk menggadaikan barang elektronik, Kakak perlu membawa identitas diri dan barang yang akan digadaikan. Sebaiknya lengkapi juga charger/adaptor, dus, kabel, atau aksesori bawaan jika tersedia karena kelengkapan dapat memengaruhi hasil penilaian barang.', 'syarat barang elektronik, syarat elektronik, gadai elektronik, charger, adaptor, dus', 590, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apa saja syarat untuk menggadaikan barang elektronik?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apa saja syarat untuk menggadaikan motor?', 'Barang & Syarat Gadai', 'Untuk gadai motor, Kakak perlu membawa unit motor, kunci motor, STNK asli, BPKB asli, dan identitas diri. Motor juga akan dicek terlebih dahulu sesuai kriteria Gadai Sakti.', 'syarat motor, gadai motor, stnk, bpkb, kunci motor', 580, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apa saja syarat untuk menggadaikan motor?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apakah bisa menggadaikan BPKB saja tanpa unit motor?', 'Barang & Syarat Gadai', 'Untuk saat ini Gadai Sakti belum dapat memproses gadai BPKB tanpa unit motor. Pengajuan gadai motor dilakukan dengan membawa unit beserta dokumen yang dipersyaratkan.', 'bpkb saja, tanpa unit motor, tanpa motor, gadai bpkb', 570, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apakah bisa menggadaikan BPKB saja tanpa unit motor?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Barang saya tidak lengkap, apakah masih bisa digadaikan?', 'Barang & Syarat Gadai', 'Masih dapat diajukan Kak. Kelengkapan barang akan menjadi salah satu faktor dalam proses penilaian. Silakan bawa kelengkapan yang masih tersedia saat datang ke cabang.', 'barang tidak lengkap, kelengkapan barang, tanpa dus, tanpa charger, aksesori tidak lengkap', 560, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Barang saya tidak lengkap, apakah masih bisa digadaikan?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana proses gadai di Gadai Sakti?', 'Proses & Biaya Gadai', 'Prosesnya sederhana:
1. Datang ke cabang membawa barang dan identitas.
2. Barang dicek dan ditaksir.
3. Jika nominal disetujui, proses gadai dilanjutkan.
4. Dana dicairkan.
5. Jatuh tempo 30 hari dari tanggal kredit, diberikan masa toleransi 15 hari dari tanggal jatuh tempo lalu otomatis masuk proses lelang.

Sistem gadainya: tenor 30 hari, pinjaman terima bersih dari tarif sewa 10% + admin 1% dari pinjaman. Pelunasan tetap sesuai pinjaman.', 'proses gadai, bagaimana proses, cara gadai, sistem gadai, tenor, biaya gadai, sewa modal', 550, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana proses gadai di Gadai Sakti?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Berapa lama proses gadai sampai dana cair?', 'Proses & Biaya Gadai', 'Proses pengecekan dan pencairan umumnya sekitar 15-30 menit, tergantung jenis dan kondisi barang serta kelengkapan data.', 'berapa lama proses, lama proses, proses pencairan, dana cair berapa lama, 15 30 menit', 540, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Berapa lama proses gadai sampai dana cair?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana dana gadai dapat dicairkan?', 'Proses & Biaya Gadai', 'Dana dapat dicairkan sesuai metode tunai ataupun transfer yang tersedia di Gadai Sakti. Untuk ketentuan transfer, penjamin dan pemilik harus sama, dan jika nomor rekening selain Bank BCA harus bersedia dikenakan admin sesuai dengan bank terkait.', 'dana dicairkan, pencairan dana, tunai, transfer, rekening, bank bca', 530, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana dana gadai dapat dicairkan?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Berapa lama masa gadai?', 'Pelunasan & Pembayaran', 'Masa gadai adalah 30 hari sejak tanggal transaksi.', 'berapa lama masa gadai, masa gadai, jatuh tempo berapa hari, tenor gadai 30 hari', 520, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Berapa lama masa gadai?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana jika belum bisa melunasi saat jatuh tempo?', 'Pelunasan & Pembayaran', 'Jika belum dapat melunasi, gadai dapat diperpanjang sesuai ketentuan Gadai Sakti dengan membayar biaya perpanjangan yang berlaku.', 'belum bisa melunasi, belum lunas, jatuh tempo belum lunas, perpanjang gadai', 510, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana jika belum bisa melunasi saat jatuh tempo?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Berapa kali gadai dapat diperpanjang?', 'Pelunasan & Pembayaran', 'Perpanjangan dapat dilakukan maksimal 3 kali untuk setiap barang sesuai ketentuan yang berlaku.', 'berapa kali diperpanjang, maksimal perpanjangan, perpanjang berapa kali, perpanjangan 3 kali', 500, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Berapa kali gadai dapat diperpanjang?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apakah ada denda jika terlambat melakukan perpanjangan?', 'Pelunasan & Pembayaran', 'Ada. Denda keterlambatan dikenakan sebesar 0,35% per hari dari nilai pinjaman setelah melewati tanggal jatuh tempo, sesuai masa toleransi yang berlaku.', 'denda terlambat, denda keterlambatan, terlambat perpanjangan, denda 0 35', 490, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apakah ada denda jika terlambat melakukan perpanjangan?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apa yang terjadi jika barang tidak dilunasi atau tidak diperpanjang?', 'Pelunasan & Pembayaran', 'Setelah melewati jatuh tempo dan masa toleransi yang berlaku, barang dapat masuk ke proses lelang.', 'tidak dilunasi, tidak diperpanjang, masuk lelang, lewat jatuh tempo, barang tidak lunas', 480, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apa yang terjadi jika barang tidak dilunasi atau tidak diperpanjang?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana cara menebus atau melunasi barang gadai?', 'Pelunasan & Pembayaran', 'Kakak dapat melakukan pelunasan sesuai ketentuan transaksi dengan membawa dokumen yang diperlukan ke cabang Gadai Sakti. Setelah proses pelunasan selesai, barang jaminan dapat diambil kembali.', 'menebus barang, tebus gadai, pelunasan barang, lunasi barang, ambil barang', 470, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana cara menebus atau melunasi barang gadai?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apakah pelunasan bisa diwakilkan?', 'Pelunasan & Pembayaran', 'Bisa. Pihak yang mewakili perlu membawa:
- Surat Bukti Gadai asli
- Identitas asli nasabah
- Identitas asli pihak yang mewakili
- Surat kuasa yang telah diisi dan ditandatangani sesuai ketentuan.', 'pelunasan diwakilkan, diwakilkan, surat kuasa, wakil pelunasan', 460, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apakah pelunasan bisa diwakilkan?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana cara melakukan pembayaran?', 'Pelunasan & Pembayaran', 'Pembayaran dapat dilakukan melalui transfer bank atau secara tunai di cabang, sesuai jenis transaksi dan ketentuan yang berlaku.', 'cara pembayaran, pembayaran, transfer pembayaran, bayar tunai, bukti transfer', 450, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana cara melakukan pembayaran?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Di mana cabang Gadai Sakti terdekat dari lokasi saya?', 'Lokasi & Kunjungan Cabang', 'Tentu Kak. Silakan informasikan:
Kota/Kabupaten =
Kecamatan =
Kelurahan =

Kami bantu cek cabang Gadai Sakti terdekat sesuai daerah tersebut ya Kak.', 'cabang terdekat, lokasi cabang, cabang sekitar, alamat cabang, cabang dimana', 440, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Di mana cabang Gadai Sakti terdekat dari lokasi saya?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Jam berapa cabang Gadai Sakti buka?', 'Lokasi & Kunjungan Cabang', 'Gadai Sakti siap melayani kebutuhan gadai Kakak dengan jam operasional:
Senin-Jumat: 08.30-21.00 WIB
Sabtu: 08.30-20.00 WIB
Minggu: Cabang tetap buka

Untuk jam operasional cabang tertentu, bisa berbeda ya, Kak.', 'jam buka, jam operasional, buka jam, hari minggu buka, senin jumat, sabtu', 430, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Jam berapa cabang Gadai Sakti buka?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Apakah Gadai Sakti menjual barang lelang kepada masyarakat umum?', 'Pertanyaan Lainnya', 'Untuk saat ini, barang lelang Gadai Sakti tidak ditawarkan untuk penjualan langsung kepada masyarakat umum.', 'jual barang lelang, beli barang lelang, ada barang lelang, lelang masyarakat, mau beli lelang', 420, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Apakah Gadai Sakti menjual barang lelang kepada masyarakat umum?' LIMIT 1);

INSERT INTO live_chat_quick_replies (title, category, message, keywords, priority, auto_send, active, customer_visible)
SELECT 'Bagaimana cara melihat lowongan kerja di Gadai Sakti?', 'Pertanyaan Lainnya', 'Untuk informasi lowongan pekerjaan, Kakak dapat menghubungi Tim HR Gadai Sakti melalui tombol WhatsApp yang tersedia di Live Chat.', 'lowongan kerja, loker, karir, pekerjaan, hrd, melamar, lamaran, rekrutmen', 410, 1, 1, 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM live_chat_quick_replies WHERE title = 'Bagaimana cara melihat lowongan kerja di Gadai Sakti?' LIMIT 1);

UPDATE live_chat_quick_replies SET customer_visible = 1 WHERE title IN ('Barang apa saja yang bisa digadaikan di Gadai Sakti?','Apa saja syarat untuk menggadaikan barang elektronik?','Apa saja syarat untuk menggadaikan motor?','Apakah bisa menggadaikan BPKB saja tanpa unit motor?','Barang saya tidak lengkap, apakah masih bisa digadaikan?','Bagaimana proses gadai di Gadai Sakti?','Berapa lama proses gadai sampai dana cair?','Bagaimana dana gadai dapat dicairkan?','Berapa lama masa gadai?','Bagaimana jika belum bisa melunasi saat jatuh tempo?','Berapa kali gadai dapat diperpanjang?','Apakah ada denda jika terlambat melakukan perpanjangan?','Apa yang terjadi jika barang tidak dilunasi atau tidak diperpanjang?','Bagaimana cara menebus atau melunasi barang gadai?','Apakah pelunasan bisa diwakilkan?','Bagaimana cara melakukan pembayaran?','Di mana cabang Gadai Sakti terdekat dari lokasi saya?','Jam berapa cabang Gadai Sakti buka?','Apakah Gadai Sakti menjual barang lelang kepada masyarakat umum?','Bagaimana cara melihat lowongan kerja di Gadai Sakti?');
