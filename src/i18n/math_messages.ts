import { defineMessages } from "react-intl";

export const mathMessages = defineMessages({
  // App Title
  appTitle: {
    defaultMessage: "MathLine – Visualisasi Garis Bilangan",
    description: "App header title for MathLine",
  },
  topicLabel: {
    defaultMessage: "Topik Materi",
    description: "Label for topic dropdown selector",
  },
  problemLabel: {
    defaultMessage: "Soal",
    description: "Label for math problem input field",
  },
  // Topics
  topicIntegersOps: {
    defaultMessage: "Bilangan Bulat: Penjumlahan & Pengurangan",
    description: "Dropdown option for integers addition and subtraction",
  },
  topicIntegersOrder: {
    defaultMessage: "Bilangan Bulat: Bandingkan & Urutkan",
    description: "Dropdown option for integers comparing and ordering",
  },
  topicLinearEq: {
    defaultMessage: "Persamaan Linear Satu Variabel (PLSV)",
    description: "Dropdown option for linear equations",
  },
  topicLinearIneq: {
    defaultMessage: "Pertidaksamaan Linear Satu Variabel (PtLSV)",
    description: "Dropdown option for linear inequalities",
  },
  // Placeholders
  placeholderIntegersOps: {
    defaultMessage: "contoh: -3 + 5 atau 4 - (-2)",
    description: "Input placeholder for integer operations",
  },
  placeholderIntegersOrder: {
    defaultMessage: "contoh: -5, 3, 0, -1",
    description: "Input placeholder for integer ordering",
  },
  placeholderLinearEq: {
    defaultMessage: "contoh: 2x - 3 = 7 atau 3(x - 2) = 2x + 1",
    description: "Input placeholder for linear equations",
  },
  placeholderLinearIneq: {
    defaultMessage: "contoh: 2x + 3 < 7 atau -3 < x <= 4",
    description: "Input placeholder for linear inequalities",
  },
  // Buttons
  btnShow: {
    defaultMessage: "Tampilkan garis bilangan",
    description: "Button to generate and display the number line",
  },
  btnReset: {
    defaultMessage: "Reset",
    description: "Button to reset inputs",
  },
  btnAddToDesign: {
    defaultMessage: "Tambahkan ke desain",
    description: "Button to add the number line to the Canva canvas",
  },
  btnUpdateElement: {
    defaultMessage: "Perbarui garis bilangan",
    description: "Button to update the currently selected number line element on canvas",
  },
  btnAddAsNew: {
    defaultMessage: "Tambahkan sebagai garis bilangan baru",
    description: "Button to add as a new element instead of updating",
  },
  btnAddSteps: {
    defaultMessage: "Tambahkan langkah sebagai teks",
    description: "Button to insert step-by-step solution as text in Canva",
  },
  // Notifications & alerts
  editingBanner: {
    defaultMessage: "Anda sedang mengedit garis bilangan yang dipilih di kanvas.",
    description: "Alert banner when editing an existing number line from the canvas",
  },
  autoTopicSwitched: {
    defaultMessage: "Topik otomatis dialihkan ke {topicName} berdasarkan input Anda.",
    description: "Notification shown when topic was automatically switched",
  },
  addedAsImage: {
    defaultMessage: "Garis bilangan ditambahkan sebagai gambar. Tipe desain ini tidak mendukung pembaruan interaktif.",
    description: "Notification when app element is not supported on current page",
  },
  addedSuccess: {
    defaultMessage: "Garis bilangan ditambahkan! Klik elemen ini di kanvas kapan saja untuk mengeditnya kembali.",
    description: "Notification when number line is added successfully",
  },
  updatedSuccess: {
    defaultMessage: "Garis bilangan berhasil diperbarui di kanvas!",
    description: "Notification when number line is updated",
  },
  stepsAddedSuccess: {
    defaultMessage: "Langkah penyelesaian berhasil ditambahkan ke kanvas sebagai teks!",
    description: "Notification when steps are added to canvas",
  },
  // Worksheet toggle
  worksheetToggle: {
    defaultMessage: "Mode lembar kerja (sembunyikan jawaban)",
    description: "Toggle switch to hide solution for student worksheets",
  },
  // Solution set label
  solutionSetLabel: {
    defaultMessage: "Himpunan penyelesaian = {notation}",
    description: "Label for solution set notation",
  },
  stepsHeader: {
    defaultMessage: "Langkah Penyelesaian",
    description: "Section header for solution steps",
  },
  settingsHeader: {
    defaultMessage: "Pengaturan Tampilan",
    description: "Accordion title for settings",
  },
  // Scale settings
  scaleLabel: {
    defaultMessage: "Skala Sumbu",
    description: "Label for scale setting",
  },
  scaleAuto: {
    defaultMessage: "Otomatis",
    description: "Option for automatic scale",
  },
  scaleManual: {
    defaultMessage: "Manual",
    description: "Option for manual scale",
  },
  scaleMin: {
    defaultMessage: "Batas Minimum",
    description: "Label for minimum scale",
  },
  scaleMax: {
    defaultMessage: "Batas Maksimum",
    description: "Label for maximum scale",
  },
  scaleStep: {
    defaultMessage: "Jarak Antar Titik (Step)",
    description: "Label for step interval",
  },
  // Color settings
  colorSolution: {
    defaultMessage: "Warna Solusi / Garis Penyelesaian",
    description: "Label for solution color",
  },
  colorAxis: {
    defaultMessage: "Warna Sumbu & Angka",
    description: "Label for number line axis and text color",
  },
  bgModeLabel: {
    defaultMessage: "Latar Belakang Gambar",
    description: "Label for image background",
  },
  bgWhite: {
    defaultMessage: "Putih",
    description: "Option for white background",
  },
  bgTransparent: {
    defaultMessage: "Transparan",
    description: "Option for transparent background",
  },
  bgColor: {
    defaultMessage: "Warna",
    description: "Option for colored background",
  },
  contrastWarning: {
    defaultMessage: "Kontras warna antara garis bilangan dan latar belakang rendah (< 2:1).",
    description: "Warning message when color contrast is poor",
  },
  btnFixContrast: {
    defaultMessage: "Gunakan warna garis yang mudah terbaca",
    description: "Button to automatically set high-contrast axis color",
  },
  // Font settings
  fontLabel: {
    defaultMessage: "Font Teks",
    description: "Label for font family selector",
  },
  btnChooseCanvaFont: {
    defaultMessage: "Pilih Font dari Canva...",
    description: "Button to open Canva font selector",
  },
  btnChangeCanvaFont: {
    defaultMessage: "Ubah Font Canva ({fontName})",
    description: "Button to change already selected Canva font",
  },
  btnResetFont: {
    defaultMessage: "Gunakan Font Standar",
    description: "Button to switch back from Canva font to default font",
  },
  canvaFontNotice: {
    defaultMessage: "Desain kanvas akan dirender menggunakan font Canva '{fontName}'.",
    description: "Notice that Canva font will appear in the canvas",
  },
  canvaFontNoticeDefault: {
    defaultMessage: "Menggunakan font bawaan standar. Klik tombol di atas untuk memilih font dari Canva.",
    description: "Notice when default font is in use",
  },
  // Toggles
  toggleShowSteps: {
    defaultMessage: "Tampilkan langkah penyelesaian",
    description: "Toggle to show or hide step-by-step explanation",
  },
  toggleShowLabels: {
    defaultMessage: "Tampilkan label titik & hasil",
    description: "Toggle to show labels on points and result formula",
  },
  toggleShowTitle: {
    defaultMessage: "Tampilkan judul soal di atas garis",
    description: "Toggle to display problem equation at the top of the image",
  },
  universeLabel: {
    defaultMessage: "Semesta Bilangan",
    description: "Label for universe of numbers",
  },
  universeReal: {
    defaultMessage: "Bilangan Real (ℝ)",
    description: "Real numbers option",
  },
  universeInteger: {
    defaultMessage: "Bilangan Bulat (ℤ)",
    description: "Integers option",
  },
  // Step explanations
  stepIntRewriteSubtraction: {
    defaultMessage: "Tulis ulang pengurangan menjadi penjumlahan bilangan lawan: {rewritten}",
    description: "Step explanation for rewriting integer subtraction",
  },
  stepIntJump: {
    defaultMessage: "Langkah {stepNumber}: Dari {from}, melompat {units} satuan {direction, select, right {ke kanan} other {ke kiri}} menuju {to}.",
    description: "Step explanation for jump along number line",
  },
  stepIntResult: {
    defaultMessage: "Hasil akhir: {equation}",
    description: "Final result for integer operations",
  },
  stepOrderPlot: {
    defaultMessage: "Tandai setiap bilangan pada garis bilangan: {list}",
    description: "Step explanation for plotting ordered numbers",
  },
  stepOrderAsc: {
    defaultMessage: "Urutan naik (kiri ke kanan): {result}",
    description: "Step explanation for ascending order",
  },
  stepOrderDesc: {
    defaultMessage: "Urutan turun (kanan ke kiri): {result}",
    description: "Step explanation for descending order",
  },
  stepAlgebraInitial: {
    defaultMessage: "Bentuk awal persamaan / pertidaksamaan: {equation}",
    description: "Initial equation step",
  },
  stepAlgebraCollectTerms: {
    defaultMessage: "Kelompokkan suku bervariabel di ruas kiri dan konstanta di ruas kanan: {varTerm} {relOp} {constTerm}",
    description: "Step for collecting terms",
  },
  stepAlgebraIdentity: {
    defaultMessage: "Pernyataan identitas (0 = 0). Bernilai benar untuk semua bilangan pada semesta.",
    description: "Identity explanation",
  },
  stepAlgebraContradiction: {
    defaultMessage: "Kontradiksi. Tidak ada nilai yang memenuhi (himpunan kosong ∅).",
    description: "Contradiction explanation",
  },
  stepAlgebraDivideCoeff: {
    defaultMessage: "Bagi kedua ruas dengan {divisor} untuk memperoleh nilai {variable}.",
    description: "Step for dividing by coefficient",
  },
  stepAlgebraDivideNegativeFlip: {
    defaultMessage: "Bagi kedua ruas dengan bilangan negatif {divisor}, maka arah tanda pertidaksamaan dibalik menjadi {relOp}!",
    description: "Step for dividing by negative number and flipping sign",
  },
  stepAlgebraSolutionEq: {
    defaultMessage: "Penyelesaian: {variable} = {solution}",
    description: "Final equation solution step",
  },
  stepAlgebraSolutionIneq: {
    defaultMessage: "Penyelesaian: {variable} {relOp} {solution}",
    description: "Final inequality solution step",
  },
  stepAlgebraCompoundSplit: {
    defaultMessage: "Pecah pertidaksamaan majemuk menjadi dua bagian: {ineq1} dan {ineq2}.",
    description: "Step for splitting compound inequalities",
  },
  stepAlgebraIntersectionResult: {
    defaultMessage: "Irisan daerah penyelesaian: {result}",
    description: "Step for intersection of compound inequalities",
  },
  stepAlgebraIntersectionEmpty: {
    defaultMessage: "Kedua daerah penyelesaian tidak saling beririsan. Himpunan penyelesaian kosong (∅).",
    description: "Step for empty intersection",
  },
  // Errors
  errEmptyInput: {
    defaultMessage: "Silakan masukkan soal atau ekspresi matematika.",
    description: "Error when input is empty",
  },
  errInvalidExpression: {
    defaultMessage: "Format ekspresi matematika tidak valid. Periksa kembali penulisan Anda.",
    description: "Error for invalid syntax",
  },
  errContainsLetters: {
    defaultMessage: "Huruf atau variabel tidak diperbolehkan pada operasi bilangan bulat.",
    description: "Error when integer input contains letters",
  },
  errContainsRelations: {
    defaultMessage: "Tanda relasi (=, <, >) tidak diperbolehkan pada topik ini.",
    description: "Error when relation signs used where not allowed",
  },
  errContainsMulDiv: {
    defaultMessage: "Operasi perkalian dan pembagian tidak didukung pada topik ini.",
    description: "Error for multiplication or division in integer operations",
  },
  errContainsDecimals: {
    defaultMessage: "Bilangan desimal tidak diperbolehkan. Gunakan bilangan bulat.",
    description: "Error for decimals in integer operations",
  },
  errUnpairedParentheses: {
    defaultMessage: "Tanda kurung tidak berpasangan atau tidak seimbang.",
    description: "Error for unmatched parentheses",
  },
  errTooManyNumbers: {
    defaultMessage: "Terlalu banyak angka. Maksimal {max} angka diperbolehkan.",
    description: "Error when too many numbers in integer operations",
  },
  errNumberTooLarge: {
    defaultMessage: "Angka di luar batas yang diperbolehkan ({min} sampai {max}).",
    description: "Error when number is outside -1000..1000",
  },
  errOrderTooFewNumbers: {
    defaultMessage: "Masukkan minimal {min} angka untuk dibandingkan.",
    description: "Error when fewer than 2 numbers in ordering",
  },
  errOrderTooManyNumbers: {
    defaultMessage: "Masukkan maksimal {max} angka untuk dibandingkan.",
    description: "Error when more than 10 numbers in ordering",
  },
  errNoRelationSymbol: {
    defaultMessage: "Sertakan tanda persamaan (=) atau pertidaksamaan (<, >, ≤, ≥).",
    description: "Error when equation/inequality has no relation operator",
  },
  errTooManyRelations: {
    defaultMessage: "Terlalu banyak tanda relasi dalam satu ekspresi.",
    description: "Error when too many relation operators",
  },
  errNonLinear: {
    defaultMessage: "Hanya ekspresi linear yang didukung (tidak boleh ada x² atau perkalian variabel).",
    description: "Error for non-linear equations",
  },
  errVariableInDenominator: {
    defaultMessage: "Variabel di dalam penyebut pecahan tidak didukung.",
    description: "Error for variables in denominator",
  },
  errDivisionByZero: {
    defaultMessage: "Terjadi pembagian dengan nol.",
    description: "Error for division by zero",
  },
  errCompoundInequalityInvalid: {
    defaultMessage: "Pertidaksamaan majemuk tidak boleh mengandung tanda sama dengan (=).",
    description: "Error when '=' used in compound inequalities",
  },
  errScaleInvalid: {
    defaultMessage: "Batas minimum skala harus lebih kecil dari batas maksimum.",
    description: "Error when manual scale min >= max",
  },
  errAppElementTooLarge: {
    defaultMessage: "Ukuran data elemen melebihi 5 KB. Sederhanakan teks atau ekspresi.",
    description: "Error when app element data exceeds 5KB",
  },
});
