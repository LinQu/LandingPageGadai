# Perubahan Landing Page Gadai Sakti

## Yang sudah diubah

- Susunan landing page disesuaikan dengan mockup: Hero -> Layanan -> Lokasi Cabang -> Proses Gadai -> Testimoni -> FAQ -> Footer.
- Header dan footer dirombak agar lebih dekat dengan visual mockup.
- Hero dibuat dengan nuansa biru muda, wave hijau, CTA simulasi, dan 4 poin keunggulan.
- Layanan dibuat menjadi 9 kartu kategori.
- Proses gadai disederhanakan menjadi 4 langkah.
- Testimoni diubah menjadi layout rating besar + daftar review.
- FAQ diubah menjadi layout dua kolom dengan kartu bantuan.
- Dark mode otomatis dinonaktifkan agar warna brand landing page tetap konsisten.

## Maps lokasi cabang

Landing page sekarang memakai Leaflet 1.9.4 dan OpenStreetMap untuk peta interaktif tanpa Google Maps JavaScript API berbayar.

Fitur:

- marker seluruh cabang yang memiliki latitude/longitude valid;
- pencarian berdasarkan nama cabang, kota, provinsi, atau alamat;
- tombol `Gunakan lokasi saya saat ini`;
- penghitungan cabang terdekat menggunakan Haversine;
- marker lokasi user;
- klik marker untuk memilih cabang;
- tombol petunjuk arah membuka Google Maps menggunakan URL biasa (tanpa API key).

Leaflet dimuat dari CDN resmi yang dicantumkan di dokumentasi Leaflet. Tile map memakai OpenStreetMap dan attribution tetap ditampilkan.

## Bug yang diperbaiki

- Urutan latitude/longitude pada perhitungan jarak cabang sebelumnya tertukar.
- Link Google Maps pada halaman `/cabang` sebelumnya memakai urutan koordinat yang keliru; sekarang memakai format directions `latitude,longitude`.
- Jarak tidak lagi dihitung dari koordinat `0,0` ketika user belum memberikan izin lokasi.

## Menjalankan project

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `NSS_API_URL` dengan endpoint backend yang dipakai project.
3. Jalankan instalasi dependency project seperti biasa.
4. Jalankan `npm run dev` atau package manager yang biasa dipakai project.
5. Buka `http://localhost:3000`.

Geolocation browser dapat dipakai di `localhost`. Untuk production, website harus memakai HTTPS agar izin lokasi bekerja dengan normal.
