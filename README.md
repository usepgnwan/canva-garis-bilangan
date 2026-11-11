# MathLine – Visualisasi Garis Bilangan (Canva App)

MathLine adalah aplikasi Canva edukatif dan interaktif yang memudahkan guru membuat media pembelajaran matematika berbasis garis bilangan untuk materi:
1. **Bilangan Bulat**: Penjumlahan & Pengurangan (panah lompatan bertingkat dari 0, penulisan ulang pengurangan sebagai lawan).
2. **Bilangan Bulat**: Membandingkan & Mengurutkan (titik berlabel, urutan naik & turun).
3. **Persamaan Linear Satu Variabel (PLSV)** (perhitungan pecahan eksak, himpunan penyelesaian).
4. **Pertidaksamaan Linear Satu Variabel (PtLSV)** (pembalikan tanda otomatis saat dikali/dibagi negatif, arsiran interval, semesta bilangan real/bulat).

Dilengkapi dengan fitur **Worksheet Mode (sembunyikan jawaban)** untuk membuat lembar kerja siswa dan **Update Number Line** untuk menyunting kembali garis bilangan yang sudah ada di kanvas desain.

---

## 🚀 Cara Menjalankan

### Persyaratan Sistem
- Node.js versi 22+ (didukung hingga Node 26)
- npm atau nvm

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Server Pengembangan (Dev)
```bash
npm start
```
Server dev akan berjalan di `http://localhost:8080`. Untuk melakukan pratinjau di Canva:
- Buka [Canva Developer Portal](https://www.canva.com/developers/apps) dan klik tombol **Preview**, atau
- Jalankan `npx @canva/cli apps start --preview`.

### 3. Menjalankan Pengujian (Unit Tests)
```bash
npm test
```

### 4. Pemeriksaan Tipe & Linting
```bash
npm run lint:types  # Type checking via tsc
npm run lint        # ESLint dengan aturan formatjs dan Canva SDK
```

### 5. Build Produksi
```bash
npm run build
```
Menghasilkan bundle produksi di direktori `dist/`:
- `dist/app.js` (Ukuran bundle < 5 MB)
- `dist/messages_en.json` (Ekstraksi pesan lokalisasi formatjs < 1 MB)

---

## 🔒 Izin Canva App (`canva-app.json`)

Aplikasi ini menggunakan izin resmi Canva Apps SDK berikut:
- `canva:design:content:write`: Untuk menyisipkan dan memperbarui app element garis bilangan dan menambahkan kotak teks langkah ke desain Canva.
- `canva:asset:private:write`: Untuk mengunggah aset gambar PNG 3× dengan aman ke pustaka media pengguna.

---

## ✨ Fitur Utama

- **Live Sticky Preview**: Pratinjau garis bilangan menempel di atas panel dengan latar padat sehingga tetap terlihat jelas saat formulir digulir.
- **Deteksi Materi Otomatis**: Mengenali secara otomatis apakah soal berupa persamaan, pertidaksamaan, operasi, atau pengurutan bilangan.
- **Bilah Tombol Simbol**: Tombol cepat untuk memasukkan operator dan simbol matematika (`+ − ( )`, `, −`, `= ( )`, `< > ≤ ≥ ( )`).
- **Pecahan Eksak**: Semua perhitungan aljabar diselesaikan dalam pecahan eksak (mis. `3x = 7` menghasilkan `7/3 ≈ 2,33`).
- **Pembalikan Tanda Otomatis**: Penandaan khusus (*highlight*) saat pertidaksamaan dibalik karena pembagian/perkalian bilangan negatif.
- **Pustaka Font Canva**: Terintegrasi langsung dengan pemilih font Canva (`requestFontSelection`), di mana teks dibuat langsung sebagai teks Canva dengan koordinat presisi.
- **Mode Lembar Kerja (Worksheet Mode)**: Menyembunyikan solusi dan jawaban untuk dijadikan bahan latihan/soal siswa.
- **Update Dinamis dari Kanvas**: Klik garis bilangan mana pun di kanvas Canva untuk memuat ulang data dan mengubahnya secara langsung di tempat (*Update number line*).
- **Pratinjau Web Mandiri**: Tersedia di `web_preview/index.html` (dapat langsung dibuka di peramban web tanpa App UI Kit).

---

## 📋 Checklist Sebelum Review Canva

Sebelum mengirimkan aplikasi ke Canva Developer Portal untuk proses review, pastikan hal-hal berikut:

- [x] Lolos pemeriksaan TypeScript (`npm run lint:types`).
- [x] Lolos ESLint (`npm run lint`) tanpa kesalahan.
- [x] Lolos semua suite pengujian Jest (`npm test`).
- [x] Build produksi berhasil (`npm run build`) menghasilkan `app.js` (< 5 MB) dan `messages_en.json` (< 1 MB).
- [x] Pastikan `canva-app.json` berisi izin yang benar (`canva:design:content:write` dan `canva:asset:private:write`).
- [x] Uji tampilan aplikasi pada tema **Terang (Light)** dan tema **Gelap (Dark)** Canva.
- [x] Uji di berbagai jenis format desain Canva: Presentasi, Dokumen A4, Poster, dan Canva Docs.
- [x] Uji alur lengkap:
  1. Klik **Add to design**.
  2. Klik area kanvas di luar elemen.
  3. Klik kembali garis bilangan di kanvas -> verifikasi tombol **Update number line** aktif.
  4. Ubah angka/warna lalu klik **Update number line** -> verifikasi elemen diperbarui di tempat.
  5. Coba perbesar/pindahkan gambar lalu perbarui kembali.
- [x] Uji integrasi font Canva (`Choose a font from Canva`) dan kembalikan ke font bawaan (`Use a built-in font`).
- [x] Pastikan deskripsi listing aplikasi dan materi promosi tidak memuat tautan luar (eksternal) yang tidak diizinkan.
