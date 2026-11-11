# MathLine – Prompt Pembuatan & Panduan Agen (v3)

Dokumen ini menggabungkan dua bagian:

- **Bagian A – Prompt pembuatan aplikasi:** spesifikasi lengkap MathLine untuk membangun (ulang) aplikasi.
- **Bagian B – Panduan agen:** aturan untuk agen pengodean (Claude Code, Cursor, dll.) saat mengubah kode MathLine, termasuk fitur wajib memperbarui gambar dari kanvas.

---

## Bagian A – Prompt Pembuatan Aplikasi

Buatlah sebuah **Canva App** yang interaktif, edukatif, dan mudah digunakan untuk membantu guru membuat media pembelajaran matematika berbasis **garis bilangan**, untuk materi:

1. **Bilangan Bulat** (SD kelas 6 – SMP kelas 7): penjumlahan & pengurangan, serta membandingkan & mengurutkan.
2. **Persamaan Linear Satu Variabel (PLSV)**.
3. **Pertidaksamaan Linear Satu Variabel (PtLSV)**.

**Nama aplikasi:** MathLine – Visualisasi Garis Bilangan

---

### 1. Tujuan

- Memvisualisasikan operasi bilangan bulat, urutan bilangan, serta penyelesaian persamaan dan pertidaksamaan linear pada garis bilangan.
- Menampilkan langkah penyelesaian secara bertahap beserta penjelasannya.
- Menghasilkan visual yang dapat dimasukkan ke desain Canva (LKPD, poster, presentasi) dan **dapat diperbarui** setelah dimasukkan.

### 2. Ketentuan Teknis (wajib)

- Bangun dengan **Canva Apps SDK** (React + TypeScript), berdasarkan Canva Apps SDK Starter Kit.
- Gunakan **App UI Kit** untuk semua komponen (Button, Switch, Select, SegmentedControl, Swatch, ColorSelector, Accordion, Alert, FormField, NumberInput, TextInput).
- Gambar garis bilangan dengan **SVG** (presisi), lalu render ke **PNG 3×** saat dimasukkan ke desain.
- Semua perhitungan PLSV/PtLSV memakai **pecahan eksak**, bukan desimal (mis. 3x = 7 → x = 7/3, label "7/3 ≈ 2,33").
- Pisahkan kode menjadi: mesin aljabar, mesin bilangan bulat, penggambar SVG, tata letak teks Canva, teks/terjemahan, jembatan Canva SDK, dan antarmuka.
- Sertakan **`canva-app.json`** dengan izin:
  - `canva:design:content:write`
  - `canva:asset:private:write`
- Semua input, tombol, dan visualisasi harus berfungsi; jangan membuat tampilan statis.

### 3. Lokalisasi (wajib untuk review Canva)

- Semua teks UI memakai `react-intl` dengan **bahasa sumber bahasa Inggris (US English)**, dan setiap teks diberi `description` untuk penerjemah.
- **Mesin hitung tidak boleh menghasilkan kalimat.** Mesin mengembalikan **kode + parameter**, lalu UI menyusun kalimatnya. Ini berlaku untuk penjelasan langkah, pesan galat, deskripsi garis bilangan, dan galat skala.
- Teks di dalam gambar (label himpunan penyelesaian, catatan) dibuat lewat `react-intl`.
- Label himpunan penyelesaian ditulis "Solution set = {notation}", dengan petunjuk untuk penerjemah agar memakai singkatan setempat (Indonesia: "HP").
- Pemisah desimal mengikuti bahasa pengguna.
- Aktifkan aturan lint i18n Canva. Build harus menghasilkan `messages_en.json`.

### 4. Tata Letak Antarmuka

- Mengikuti **tema terang & gelap** Canva; semua warna panel memakai **token warna App UI Kit**.
- Urutan dari atas ke bawah:
  1. Judul MathLine.
  2. **Pratinjau garis bilangan yang menempel di atas (sticky) dan tetap terlihat saat panel digulir.** Latarnya padat agar konten yang digulir tidak tembus.
  3. Input soal.
  4. Hasil, langkah, dan tombol aksi.
  5. Pengaturan dalam **Accordion** yang bisa dibuka-tutup.
- Pada layar lebar (≥ 720 px): input dan pengaturan di kiri, hasil di kanan.
- Tanpa tombol zoom, tanpa contoh soal, tanpa soal acak, dan tanpa tombol unduh.

### 5. Input

- **Materi** (dropdown):
  - Bilangan bulat: penjumlahan & pengurangan
  - Bilangan bulat: membandingkan & mengurutkan
  - Persamaan linear
  - Pertidaksamaan linear
- **Kolom soal**: placeholder dan petunjuk menyesuaikan materi.
- **Tombol simbol per materi**:
  - Operasi: `+ − ( )`
  - Urutan: `, −`
  - Persamaan: `= ( )`
  - Pertidaksamaan: `< > ≤ ≥ ( )`
- Tombol **Show number line** (Enter juga bisa) dan **Reset**.
- **Deteksi materi otomatis**: soal berisi huruf atau tanda relasi → persamaan/pertidaksamaan; berisi koma → urutan; selain itu → operasi. Jika berbeda dari materi yang dipilih, materi dipindahkan dan muncul pemberitahuan. Saat guru mengganti materi dan soal tidak cocok, kolom soal dikosongkan.

### 6. Materi Bilangan Bulat

#### a. Penjumlahan & pengurangan

Contoh soal: `-3 + 5`, `4 - (-2)`, `2 + (-6) - 3`. Batas: maksimal 6 bilangan, nilai −1000 sampai 1000.

- **Panah lompatan** bertingkat di atas garis. Panah pertama **selalu dimulai dari 0** (sesuai buku paket di Indonesia).
- Label setiap panah (−3, +5), garis bantu putus-putus ke sumbu, titik 0, dan titik hasil.
- Langkah penyelesaian:
  1. Tulis ulang pengurangan sebagai penjumlahan lawan.
  2. Jelaskan setiap lompatan ("Dari 4, melangkah 2 satuan ke kanan sampai 6").
  3. Hasil akhir.
- Baris hasil di gambar: `−3 + 5 = 2`.
- Pesan galat: perkalian/pembagian, desimal, huruf, tanda relasi, terlalu besar, terlalu banyak bilangan, kurung tidak berpasangan.

#### b. Membandingkan & mengurutkan

Contoh soal: `-5, 3, 0, -1` (2–10 bilangan, dipisah koma, titik koma, atau spasi).

- Titik berlabel di setiap bilangan.
- Hasil: `−5 < −1 < 0 < 3` dan `3 > 0 > −1 > −5`. Bilangan kembar ditulis dengan `=`.

### 7. Materi PLSV & PtLSV

Contoh soal yang harus didukung:

- `x + 2 = 5`, `2x − 3 = 7`, `3(x − 2) = 2x + 1`, `x/2 + 1 = 4`, `3x = 7`
- `x + 4 < 8`, `2x − 6 ≥ 4`, `2x + 3 < x + 7`, `−2x + 1 > 7`, `5 − 3x ≥ −1`
- Pertidaksamaan bersusun: `−3 < x ≤ 4`, `−1 < 2x + 1 ≤ 7`, `5 > x ≥ −1`, dan bentuk umum `x − 1 < 2x + 1 < x + 5` (dipisah lalu diiris)

Aturan langkah penyelesaian:

- Sederhanakan, tukar ruas bila perlu, pindahkan suku variabel lalu konstanta, kemudian bagi/kalikan dengan koefisien.
- **Saat dikali/dibagi bilangan negatif, balik tanda pertidaksamaan otomatis** dan tandai langkahnya dengan warna mencolok.
- Kasus khusus: identitas (semua bilangan) dan kontradiksi (∅).

Visualisasi:

- Titik kosong untuk < atau >, titik penuh untuk ≤ atau ≥.
- Garis tebal + arsiran + panah ke arah tak terbatas.
- Label nilai, dan HP, mis. `{x | x < 4, x ∈ ℝ}`.
- **Semesta**: bilangan real atau bilangan bulat (titik-titik + daftar HP). Pilihan ini hanya tampil untuk materi PLSV/PtLSV.

Input fleksibel: `<=` / `>=`, `−`, `×`, `:`, desimal dengan koma, perkalian implisit, satu variabel huruf apa pun.

### 8. Pengaturan (Accordion)

- **Skala**: otomatis (selalu memuat solusi dan, untuk bilangan bulat, angka 0), atau manual (minimum, maksimum, interval) dengan validasi.
- **Warna solusi** (arsiran, titik, panah): 6 warna pastel + pemilih warna bebas.
- **Warna garis bilangan** (sumbu, angka, teks): abu tua, hitam, biru dongker, hijau tua, cokelat, ungu tua, **putih**, **krem** + pemilih warna bebas.
- **Latar gambar**:
  - **Putih** (bawaan)
  - **Transparan**: pratinjau menampilkan pola kotak-kotak, gelap untuk garis terang dan terang untuk garis gelap
  - **Warna**: krem, biru muda, mint, merah muda, lavender, hijau papan tulis, biru dongker gelap, arang, + pemilih warna bebas
- **Peringatan kontras**: jika kontras warna garis terhadap warna latar < 2:1 (luminans WCAG), tampilkan peringatan dengan tombol **Use a readable number line color** (abu tua untuk latar terang, putih untuk latar gelap).
- **Font**:
  - 7 font bawaan: Nunito/Segoe UI, Arial, Verdana, Comic Sans, Times New Roman, Georgia, Courier New.
  - **Atau font dari pustaka Canva** lewat tombol **Choose a font from Canva** (`requestFontSelection`). Ada tombol "Change font" dan "Use a built-in font".
  - Dengan font Canva:
    - Gambar dibuat **tanpa teks**.
    - Semua teks (angka, label, judul, HP, label panah) dibuat sebagai **teks Canva** dengan font tersebut. Posisinya dihitung dari garis dasar teks pada gambar (rata tengah, ukuran disesuaikan dengan skala gambar). Teks tebal memakai bobot bold bila tersedia.
    - Gambar dan teks dikelompokkan dalam **satu app element**.
    - Pratinjau di panel memakai font pengganti, dengan catatan bahwa desain akan memakai font Canva.
    - "Add steps as text" juga memakai font Canva yang sama.
    - Jaga data app element di bawah 5 KB. Jika teks terlalu banyak, tampilkan pesan.
- Tampilkan/sembunyikan: langkah, label, soal sebagai judul di gambar.

### 9. Mode Lembar Kerja

Sakelar di bawah pratinjau: **Worksheet mode (hide the answer)**. Jika aktif, jawaban disembunyikan dan diganti tempat kosong untuk diisi siswa:

| Materi | Yang disembunyikan | Yang tampil |
|---|---|---|
| PLSV/PtLSV | titik, arsiran, label nilai | `HP = ……` |
| Operasi bilangan bulat | panah dan hasil | `−3 + 5 = ……` |
| Urutan | titik | `…… < …… < ……` |

### 10. Memasukkan & Memperbarui di Desain

- **Add to design**: unggah PNG 3×, lalu tambahkan sebagai **app element** (`initAppElement`) yang menyimpan materi, soal, semua pengaturan, font Canva (bila ada), daftar teks, dan referensi gambar.
- **Fitur perbarui (wajib):**
  - Elemen yang baru ditambahkan langsung terpilih dan siap diperbarui.
  - Kapan pun guru **mengklik gambar garis bilangan di kanvas**, panel memuat ulang soal dan semua pengaturannya, lalu menampilkan pemberitahuan "sedang menyunting".
  - Tombol utama berubah menjadi **Update number line** dan **aktif** begitu pratinjau siap. Di bawahnya ada **Add as a new number line**. Menekan Update mengganti gambar di tempatnya.
  - Saat guru mengklik di luar gambar, panel kembali ke mode biasa dengan tombol **Add to design**.
  - Pesan sukses menjelaskan bahwa garis bilangan bisa dipilih lagi untuk diubah.
  - Data versi lama tetap bisa dimuat (kompatibel mundur).
- **Seret-lepas dinonaktifkan**, karena API seret Canva hanya bisa menyisipkan gambar biasa yang tidak bisa diperbarui.
- Jika jenis desain tidak mendukung app element:
  - sisipkan gambar biasa, atau gambar + teks sebagai grup bila memakai font Canva;
  - beri tahu bahwa hasilnya tidak bisa diperbarui;
  - jika font Canva tidak bisa dipakai di jenis desain itu, minta pengguna memilih font bawaan.
- **Add steps as text**: sisipkan langkah penyelesaian sebagai kotak teks.
- **Alt text** deskriptif pada gambar (versi khusus untuk mode lembar kerja).

### 11. Pengujian & Kualitas

- **Uji mesin (Jest)**: semua contoh soal, balik tanda, pertidaksamaan bersusun, kasus khusus, galat, semesta bulat, operasi dan urutan bilangan bulat, deteksi materi, skala otomatis, mode lembar kerja, kontras warna, warna latar, pemisah desimal, dan tata letak teks Canva.
- **Uji UI**: menampilkan hasil, pesan galat, perpindahan materi, menambah app element, memuat & memperbarui elemen terpilih (termasuk elemen yang baru dibuat), klik gambar di kanvas → tombol Update aktif → klik di luar → kembali ke Add to design, fallback gambar biasa, font Canva (data, isi app element, kembali ke font bawaan), peringatan kontras, warna latar, sisipkan langkah, dan reset.
- Lolos `tsc`, lint (termasuk aturan i18n), dan `npm run build` (app.js < 5 MB, messages_en.json < 1 MB).
- Periksa tampilan di tema terang dan gelap.

### 12. Hasil Akhir

1. **Proyek Canva App lengkap** dengan README berbahasa Indonesia yang memuat: cara menjalankan, izin, dan checklist sebelum review.
   - Unggah `app.js` dan `messages_en.json`.
   - Uji di tema terang/gelap dan di presentasi, dokumen A4, poster, serta Canva Docs.
   - Uji alur tambah → pilih → ubah → Update number line, termasuk setelah gambar diperbesar atau dipindah.
   - Uji font Canva.
   - Siapkan listing tanpa tautan eksternal.
2. **Pratinjau web mandiri** (satu file HTML, berbahasa Indonesia, tanpa App UI Kit) yang memakai mesin dan penggambar yang sama, dengan pratinjau sticky di atas.

Prioritaskan akurasi matematika, kemudahan bagi guru, kepatuhan pada pedoman review Canva, dan hasil visual yang bersih.

---

## Bagian B – Panduan Agen (AGENTS.md)

Bagian ini juga ada di awal file `AGENTS.md` di dalam proyek. Panduan umum Canva Apps SDK Starter Kit ada di bawahnya pada file yang sama.

MathLine adalah Canva App untuk membuat garis bilangan: bilangan bulat (penjumlahan & pengurangan, membandingkan & mengurutkan), persamaan linear, dan pertidaksamaan linear. Detail rinci lihat Bagian A.

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

#### Uji yang harus tetap lolos (`src/intents/design_editor/__tests__/app.test.tsx`)

- `menambahkan garis bilangan sebagai app element`
- `memuat & memperbarui garis bilangan yang dipilih di desain`: klik elemen di kanvas → soal termuat → tombol **Update number line** aktif → `update` dipanggil dengan data baru.
- `setelah ditambahkan, elemen baru langsung bisa diperbarui`
- `klik gambar di kanvas → tombol Update aktif; klik di luar → kembali ke Add to design`
- `jenis desain tanpa app element: gambar biasa + pemberitahuan`
- `pratinjau tidak bisa diseret`
- Uji font Canva, warna latar, dan bilangan bulat yang menyimpan `topic` ke data app element.

Setiap perubahan pada `canva_bridge.ts`, `NumberLineData`, `loadData`, `settingsData`, atau tombol aksi **wajib** diikuti dengan `npm test` dan pengujian manual di Canva:

1. Tambahkan garis bilangan.
2. Klik di luar, lalu klik lagi gambarnya.
3. Ubah soal dan warna, lalu tekan **Update number line**.
4. Ulangi setelah gambar diperbesar atau dipindah.

### Aturan proyek lain

- **Lokalisasi:** semua teks UI memakai `react-intl` dengan bahasa sumber **Inggris** dan `description`. Mesin hitung (`src/lib/*`) **tidak boleh** menghasilkan kalimat; kembalikan kode + parameter, lalu UI menerjemahkannya (`src/i18n/math_messages.ts`).
- **Akurasi:** PLSV/PtLSV memakai pecahan eksak (`src/lib/fraction.ts`). Saat dikali/dibagi bilangan negatif, tanda pertidaksamaan dibalik dan langkahnya ditandai `flip: true`.
- **Bilangan bulat:** panah pertama selalu dimulai dari 0. Pengurangan ditulis ulang menjadi penjumlahan lawan (`src/lib/integers.ts`).
- **Tema:** warna panel memakai token App UI Kit (`--ui-kit-color-*`). Pratinjau menempel di atas (`.stickyPreview`).
- **Font Canva:** gambar dibuat tanpa teks (`separateText: true`), lalu teks dijadikan teks Canva lewat `layoutTextBoxes` (`src/lib/canva_text.ts`).
- **Pratinjau web** (`web_preview/`) berbahasa Indonesia dan tidak boleh memakai App UI Kit (ketentuan lisensi).
- Jalankan `npm test`, `npm run lint:types`, `npm run lint`, dan `npm run build` sebelum menyerahkan perubahan.
