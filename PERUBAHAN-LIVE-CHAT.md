# Patch Live Chat Gadai Sakti

Patch ini hanya berisi file baru/berubah untuk fitur Live Chat customer ↔ Admin HO.

## Fitur

- Floating WhatsApp kanan bawah diganti Live Chat.
- Konsumen wajib isi nama dan nomor HP/WhatsApp sebelum chat.
- Auto greeting saat chat dibuat.
- Pesan konsumen dan admin tersimpan di MySQL.
- Auto reply berdasarkan keyword yang dikelola dari Internal.
- Saran balas cepat Admin HO berdasarkan pesan terakhir konsumen.
- Admin dapat mengambil chat, membalas, menutup, dan membuka kembali chat.
- Status Admin: Online / Busy / Offline.
- Unread count pada Inbox.
- Fallback WhatsApp HO tetap tersedia di dalam widget.
- Token sesi chat acak disimpan di browser; database hanya menyimpan hash token.
- Anti-spam dasar: maksimal 12 pesan/menit per percakapan dan maksimal 3 sesi baru/10 menit per nomor.

## Implementasi realtime

Versi ini menggunakan polling ringan:
- Konsumen: sekitar 2,4 detik.
- Inbox Admin: sekitar 3 detik.
- Percakapan aktif Admin: sekitar 2,2 detik.

Tidak ada dependency baru, service Socket.IO, atau perubahan reverse proxy sehingga kompatibel dengan stack Next.js + MySQL + Docker saat ini.

## Migration

File migration:

`database/migrations/005-live-chat.sql`

Jalankan setelah patch berada di server:

```bash
docker compose run --rm app node scripts/migrate-live-chat.mjs
```

Jika nama service Docker di server adalah `web`, ganti `app` menjadi `web`.

Migration bersifat idempotent dan sekaligus menambahkan contoh master balas cepat awal.

## Deploy setelah rsync

```bash
cd /home/ksystem/gadai-sakti
docker compose build app
docker compose run --rm app node scripts/migrate-live-chat.mjs
docker compose up -d --force-recreate app
docker compose logs -f app
```

## Uji manual setelah deploy

1. Buka landing page dengan mode incognito.
2. Klik floating `Live Chat` kanan bawah.
3. Isi nama + nomor HP, lalu `Mulai Chat`.
4. Pastikan greeting otomatis muncul.
5. Kirim `Apakah iPhone bisa digadai?` dan pastikan auto reply HP muncul.
6. Login `/internal`, buka menu `Live Chat`.
7. Pastikan chat konsumen muncul di Inbox beserta unread count.
8. Buka chat tersebut dan pastikan saran `Gadai Handphone` muncul.
9. Klik saran, edit bila perlu, lalu kirim. Pastikan balasan muncul pada browser konsumen maksimal beberapa detik.
10. Klik `Selesai`; pastikan customer tidak bisa mengirim lagi dan dapat memilih `Mulai Chat Baru`.
11. Buka tab `Master Balas Cepat`, tambah keyword baru, lalu uji dari sesi chat baru.
12. Ubah Status Admin menjadi Offline dan tunggu sampai presence kadaluarsa; widget customer akan menampilkan `Tinggalkan pesan`.

## File penting

- `components/floating-help.tsx`: widget Live Chat customer.
- `components/internal/live-chat-manager.tsx`: Inbox dan Master Balas Cepat Admin HO.
- `app/api/live-chat/*`: API customer.
- `app/api/internal/live-chat/*`: API admin.
- `lib/live-chat-utils.ts`: matching keyword dan normalisasi nomor.
- `lib/internal/live-chat.ts`: token sesi dan helper server.
- `database/migrations/005-live-chat.sql`: tabel Live Chat.
