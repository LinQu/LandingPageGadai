# Update Live Chat FAQ V2

Update ini mengikuti dokumen `FaQ Livechat website.docx` dan hanya mengubah modul Live Chat.

## Perubahan utama

- Tampilan customer Live Chat memakai alur kategori -> pertanyaan -> auto reply -> konfirmasi bantuan.
- Kategori customer:
  - Barang dan Syarat Gadai
  - Proses dan Biaya Gadai
  - Pelunasan dan Pembayaran
  - Lokasi dan Kunjungan Cabang
  - Pertanyaan Lainnya
- 20 FAQ dari dokumen dimasukkan ke master database dan tetap dapat dikelola dari Internal > Master Balas Cepat.
- FAQ customer ditandai dengan `customer_visible` agar quick reply internal lain tidak otomatis tampil ke customer.
- Pertanyaan bebas tetap dapat diketik. Jika tidak cocok FAQ, chat menunggu balasan Admin HO.
- Pertanyaan taksiran harga / nominal pinjaman / negosiasi tidak dijawab sebagai nominal di Live Chat. Sistem memberi handoff dan Admin HO harus menghubungi customer terlebih dahulu melalui WhatsApp.
- Admin mendapat badge `WA negosiasi` dan shortcut WhatsApp langsung ke nomor customer.
- Jika pesan customer lebih dari 3 menit belum mendapat balasan Admin maupun auto reply, percakapan mendapat badge `SLA > 3m` dan notifikasi browser bila izin notifikasi sudah diberikan.
- Pertanyaan lowongan menampilkan tombol langsung ke WhatsApp Tim HR.
- Link `Butuh WhatsApp? Hubungi HO` tetap tersedia untuk pertanyaan umum dan menggunakan WhatsApp HO 6281125201419.
- Setelah FAQ terjawab, customer mendapat pilihan:
  - Sudah, terima kasih
  - Tanya pertanyaan lain
  - Gadaikan Sekarang -> `/simulasi`

## Database

Migration baru:

```text
database/migrations/006-live-chat-faq.sql
```

Migration menambahkan/mengisi `customer_visible` dan FAQ sesuai dokumen. Script migration sudah dibuat aman untuk database lama: kolom ditambahkan sebelum migration FAQ dijalankan.

Jalankan salah satu:

```bash
node scripts/migrate-live-chat.mjs
```

atau migration project:

```bash
npm run db:migrate
```

Jika menggunakan Docker dan service bernama `web`:

```bash
docker compose exec web node scripts/migrate-live-chat.mjs
```

## Checklist UAT

1. Mulai chat dengan nama dan nomor WhatsApp.
2. Pastikan greeting dan 5 kategori FAQ tampil.
3. Pilih kategori, pilih pertanyaan, pastikan jawaban sesuai master FAQ.
4. Pastikan `Lihat pertanyaan lainnya` bekerja pada kategori yang memiliki lebih dari 4 pertanyaan.
5. Setelah jawaban FAQ, cek tombol feedback dan `Gadaikan Sekarang` menuju `/simulasi`.
6. Ketik pertanyaan bebas di luar FAQ, pastikan tidak dialihkan otomatis ke WhatsApp dan masuk inbox Admin HO.
7. Ketik contoh `Xiaomi 14 Pro dapat taksiran berapa?`, pastikan customer diberi info menunggu Admin HO dan admin mendapat badge WA + tombol WhatsApp customer.
8. Pilih FAQ lowongan, pastikan tombol WhatsApp HR muncul.
9. Buat chat tanpa auto reply/admin reply selama >3 menit, pastikan badge `SLA > 3m` muncul di Internal Live Chat.
10. Aktifkan izin browser notification dan pastikan chat SLA/negosiasi menghasilkan notifikasi.
