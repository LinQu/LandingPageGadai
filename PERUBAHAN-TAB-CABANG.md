# Perubahan Tab Lokasi Cabang

## 1. Koreksi koordinat API

API cabang saat ini mengirim nama field koordinat dalam keadaan terbalik:

```json
{
  "long": "-6.2566",
  "lat": "106.7685"
}
```

Pada aplikasi nilai tersebut dinormalisasi menjadi:

- `branch.latitude = item.long`
- `branch.longitude = item.lat`

Dengan begitu Leaflet, perhitungan jarak, dan Google Maps menggunakan urutan koordinat yang benar.

## 2. Detail Lokasi

Tombol **Detail Lokasi** membuka Google Maps Directions. Jika izin lokasi browser aktif, URL juga mengirim koordinat pengguna sebagai `origin`, sehingga Google Maps langsung menampilkan rute dan estimasi jarak dari lokasi pengguna ke cabang.

## 3. Chat Admin

Tombol **Chat Admin** membuka WhatsApp nomor cabang dari field `phone` API dan mengisi pesan awal yang menyertakan nama/kode cabang.

## 4. Tampilan halaman /cabang

Halaman cabang diperbarui mengikuti mockup:

- hero "Lokasi Cabang Gadai Sakti Indonesia"
- search bar + tombol Cari Lokasi
- filter Provinsi, Kota, Kelurahan (placeholder karena API belum punya field terpisah), dan Cabang
- 6 kartu cabang per halaman (3 kolom desktop)
- indikator jarak dari lokasi pengguna jika izin geolocation diberikan
- tombol Detail Lokasi dan Chat Admin
- CTA "Tidak menemukan cabang terdekat?"

Catatan: API contoh belum menyediakan foto cabang. Kartu menggunakan visual storefront fallback agar layout tetap sesuai mockup. Jika nanti API menyediakan URL foto, bagian visual bisa langsung diganti menjadi gambar cabang asli.
