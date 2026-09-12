# Live Chat V3 - Cabang, Multi Admin, Shortcut Collapsible

## Perubahan utama

1. Pertanyaan Cepat konsumen dapat dibuka/tutup dan otomatis menutup setelah konsumen mengirim pertanyaan bebas supaya riwayat chat tidak tertutup.
2. Pertanyaan cabang/lokasi membuka pencarian cabang dengan dua opsi:
   - gunakan lokasi perangkat untuk urut jarak terdekat;
   - isi Kota/Kabupaten, Kecamatan, Kelurahan untuk pencarian sesuai domisili.
3. Hasil cabang menampilkan nama, wilayah, alamat, jam layanan, jarak (jika lokasi perangkat tersedia), Google Maps, dan WhatsApp cabang.
4. Domisili/koordinat konsumen disimpan ke percakapan dan terlihat oleh Admin HO.
5. Multi-admin:
   - nama akun admin yang menangani chat terlihat di daftar dan detail;
   - filter "Chat Saya";
   - chat yang sedang ditangani admin lain dikunci untuk mencegah balasan ganda;
   - tersedia aksi "Ambil Alih" secara eksplisit;
   - claim chat pertama menggunakan update kondisional untuk mengurangi race condition antar-admin.
6. FAQ/auto reply diperjelas formatnya dan keyword diperluas, termasuk variasi bahasa umum/typo untuk HP, laptop, motor, lokasi, pembayaran, pelunasan, lowongan, dan lain-lain.
7. Greeting dan informasi handoff taksiran/negosiasi dibuat lebih jelas.

## Database

Migration baru:

```text
database/migrations/007-live-chat-enhancements.sql
```

Kolom yang dipastikan tersedia pada `live_chat_conversations`:

```text
customer_domicile
customer_latitude
customer_longitude
```

Migration bersifat aman untuk database Live Chat yang sudah ada: script memeriksa kolom terlebih dahulu sebelum `ALTER TABLE`.

## Deploy

Setelah file patch ditimpa ke root project:

```bash
node scripts/migrate-live-chat.mjs
```

Jika aplikasi berjalan dari Docker image tanpa bind mount:

```bash
docker compose build web
docker compose up -d --force-recreate web
docker compose exec web node scripts/migrate-live-chat.mjs
```

Sesuaikan `web` dengan nama service aplikasi jika berbeda.

## UAT minimum

1. Mulai Live Chat dan pastikan tombol Pertanyaan Cepat bisa buka/tutup.
2. Ketik pertanyaan bebas, pastikan area Pertanyaan Cepat tidak menutupi histori chat.
3. Ketik "cabang terdekat" lalu isi Kota/Kabupaten dan opsi Kecamatan/Kelurahan.
4. Pastikan rekomendasi cabang tampil dan tombol Maps/WhatsApp dapat dibuka.
5. Izinkan geolocation dan pastikan hasil cabang terurut berdasarkan jarak.
6. Login sebagai Admin A, ambil satu chat, pastikan label "Ditangani: Admin A" muncul.
7. Login sebagai Admin B, buka chat yang sama, pastikan composer terkunci dan tersedia "Ambil Alih".
8. Gunakan filter "Chat Saya" dan pastikan hanya chat milik admin login yang tampil.
9. Uji pertanyaan: "kalo laptop bagaimana", "gadai hp", "bpkb saja", "cara bayar", "cabang deket sini", "ada vacancy?".
10. Uji taksiran: "laptop saya bisa cair berapa?" dan pastikan handoff WhatsApp tetap berjalan.
