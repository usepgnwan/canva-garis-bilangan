# MathLine – Panduan Agen & Canva Apps SDK Starter Kit

MathLine adalah Canva App untuk membuat garis bilangan: bilangan bulat (penjumlahan & pengurangan, membandingkan & mengurutkan), persamaan linear (PLSV), dan pertidaksamaan linear (PtLSV).

### ⚠️ FITUR WAJIB: perbarui gambar yang sudah dimasukkan ke desain

Setiap garis bilangan yang sudah dimasukkan ke desain **harus bisa diperbarui**. Alurnya:

1. Guru menekan **Add to design**, dan garis bilangan masuk ke desain sebagai **app element**.
2. Kapan pun nanti, guru **mengklik gambar garis bilangan itu di kanvas Canva**.
3. Panel MathLine otomatis memuat **soal, materi, dan semua pengaturan** dari gambar tersebut, lalu menampilkan Alert *"You're editing the selected number line…"*.
4. Tombol utama berubah menjadi **Update number line** dan **aktif** (tidak disabled) begitu pratinjau siap. Di bawahnya ada tombol **Add as a new number line**.
5. Guru mengubah apa saja, lalu menekan **Update number line**. Gambar di kanvas diganti di tempatnya, tanpa membuat gambar baru.
6. Saat guru mengklik area lain (tidak ada elemen terpilih), panel kembali ke mode biasa dengan tombol **Add to design**.

Elemen yang **baru saja ditambahkan langsung terpilih**, jadi tombol **Update number line** langsung tersedia.

#### Cara kerjanya (jangan dirusak)

| Bagian | Lokasi | Aturan |
|---|---|---|
| Klien app element | `src/canva_bridge.ts` → `getAppElementClient()` | Dibuat sekali (lazy) dengan `initAppElement<NumberLineData>({ render: buildNumberLineContent })`. |
| Data yang disimpan | `NumberLineData` di `src/canva_bridge.ts` | Berisi materi, soal, semua pengaturan, font Canva, teks, `imageRef`, dan ukuran. **Maks. 5 KB** (dicek di `prepare`). Field baru harus **opsional**, dan `DATA_VERSION` dinaikkan. |
| Isi elemen | `buildNumberLineContent(data)` | Berisi gambar, ditambah teks Canva bila memakai font Canva. Harus **murni**: hanya bergantung pada `data`. |
| Menambah | `addNumberLine()` → `appElementClient.addElement({ data })` | Jangan memakai `addElementAtPoint` untuk gambar garis bilangan, **kecuali** sebagai fallback bila app element tidak didukung (lalu tampilkan pesan `addedAsImage`). |
| Mendeteksi klik di kanvas | `useEffect` di `src/intents/design_editor/app.tsx` → `getAppElementClient().registerOnElementChange(...)` | Didaftarkan **sekali** saat mount. `el` ada → `setSelected(el)` dan `loadData(el.data)`. `el` kosong → `setSelected(null)`. |
| Mencegah muat ulang ganda | `lastLoaded` (ref, berisi `imageRef`) | Diisi sebelum `addElement` dan sebelum `update`, agar data yang baru disimpan tidak dimuat ulang dan pesan sukses tidak hilang. Dikosongkan saat elemen tidak terpilih. |
| Memperbarui | `updateSelected()` → `canva.prepare(...)` lalu `selected.update({ data })` | Selalu unggah PNG baru (`imageRef` baru). Jangan memakai API lama `addOrUpdateElement`. |
| Tombol | `outputPanel` | `selected ? (Update number line + Add as a new number line) : Add to design`. Keduanya `disabled={!ready}`, dengan `ready = !!result && !!png && !busy`. |
| Kompatibilitas data lama | `loadData()` | Data versi 1 tidak punya `topic` / `backgroundMode` / font Canva. Ambil nilai bawaannya (`background` → white/transparent, `topic` → deteksi dari soal). **Jangan menghapus dukungan ini.** |

#### Hal yang DILARANG

- **Seret-lepas (drag & drop) dari pratinjau.** `ui.startDragToPoint` / `startDragToCursor` hanya menyisipkan gambar biasa, sehingga gambar itu **tidak bisa diperbarui**. Pratinjau sengaja `draggable={false}`.
- Menyisipkan garis bilangan sebagai gambar biasa di jalur normal.
- Menyimpan data di luar app element (mis. `localStorage`) untuk keperluan sunting ulang.
- Memanggil `registerOnElementChange` lebih dari sekali, atau di dalam render.

#### Aturan proyek lain

- **Lokalisasi:** semua teks UI memakai `react-intl` dengan bahasa sumber **Inggris** dan `description`. Mesin hitung (`src/lib/*`) **tidak boleh** menghasilkan kalimat; kembalikan kode + parameter, lalu UI menerjemahkannya (`src/i18n/math_messages.ts`).
- **Akurasi:** PLSV/PtLSV memakai pecahan eksak (`src/lib/fraction.ts`). Saat dikali/dibagi bilangan negatif, tanda pertidaksamaan dibalik dan langkahnya ditandai `flip: true`.
- **Bilangan bulat:** panah pertama selalu dimulai dari 0. Pengurangan ditulis ulang menjadi penjumlahan lawan (`src/lib/integers.ts`).
- **Tema:** warna panel memakai token App UI Kit (`--ui-kit-color-*`). Pratinjau menempel di atas (`.stickyPreview`).
- **Font Canva:** gambar dibuat tanpa teks (`separateText: true`), lalu teks dijadikan teks Canva lewat `layoutTextBoxes` (`src/lib/canva_text.ts`).
- **Pratinjau web** (`web_preview/`) berbahasa Indonesia dan tidak boleh memakai App UI Kit (ketentuan lisensi).
- Jalankan `npm test`, `npm run lint:types`, `npm run lint`, dan `npm run build` sebelum menyerahkan perubahan.

---

# Canva Apps SDK Starter Kit - General Guide

## Overview

This project is for creating Canva Apps, which are react single page applications (SPA) that run in the Canva Editor, and other pages in Canva.
The app, once submitted to Canva, will be rendered in a sandboxed iframe within a standard HTML shell.

## Commands

- **Build**: `npm run build` - Production build with localization message extraction (`dist/app.js`, `dist/messages_en.json`).
- **Dev**: `npm start` - Start development server (localhost:8080).
- **Test**: `npm test` - Run Jest tests (`npm run test:watch` for watch mode).
- **Type Check**: `npm run lint:types` - TypeScript type checking.
- **Lint**: `npm run lint` - ESLint check (`npm run lint:fix` to auto-fix).
- **Format**: `npm run format` - Prettier formatting.
