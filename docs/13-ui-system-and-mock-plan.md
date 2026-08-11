# UI System dan Rencana Mock Interaktif

Dokumen ini mendefinisikan bahasa visual, inventaris komponen, layout per layar, serta arsitektur **mock end-to-end yang dapat dijalankan dengan satu klik** tanpa backend, tanpa LLM, dan tanpa biaya token.

Alur, state, dan gate yang dirujuk di sini didefinisikan di [workflow aplikasi](12-application-workflow.md).

---

# Bagian I — Design System

## Design intent

Tiga kalimat yang mengikat setiap keputusan visual:

1. **Tenang tapi padat.** Layar boleh memuat banyak informasi; yang tidak boleh adalah banyak *warna*. Hierarki dibangun oleh ukuran, berat huruf, dan ruang kosong — bukan oleh palet.
2. **Terlihat seperti instrumen, bukan seperti mainan AI.** Produk ini menyampaikan angka yang dipakai orang untuk memutuskan modal puluhan juta rupiah. Tampilannya harus meminjam kredibilitas dokumen analis, bukan estetika chatbot.
3. **Ketidakpastian adalah bagian dari desain, bukan catatan kaki.** Confidence, sumber, dan keterbatasan punya slot visual tetap. Desain yang menyembunyikannya dianggap cacat, bukan bersih.

### Anti-goals

Hal berikut dilarang karena membuat produk tampak seperti demo AI generik:

- gradien ungu–biru, glow, glassmorphism, dan neon;
- emoji sebagai ikon fungsional;
- ilustrasi 3D generik dan avatar robot;
- animasi "AI sedang berpikir" yang tidak terikat state nyata;
- lebih dari satu warna aksen per layar;
- kartu bertumpuk dengan bayangan tebal.

## Tokens

### Warna

Neutral memikul 90% permukaan. Aksen dipakai hanya untuk aksi utama dan satu titik fokus per layar.

```text
# Ink (teks & garis)
ink-900   #101413   judul
ink-700   #2E3634   body
ink-500   #5C6663   sekunder
ink-400   #8A9391   label, caption
line      #E4E7E6   hairline border
line-soft #EFF2F1   pemisah dalam kartu

# Surface
canvas    #F7F9F8   latar halaman
surface   #FFFFFF   kartu
surface-2 #F4F6F5   fill lembut, kode, tabel header

# Brand (teal)
teal-700  #0E5A63   tombol primer, tab aktif
teal-600  #14707A   hover
teal-500  #1A8891   tautan, ikon aksen
teal-50   #E8F2F2   fill lembut brand

# Fokus tunggal (skor & atensi)
amber-600 #D4610A   angka skor, highlight tunggal
amber-50  #FDF1E7

# Semantik — hanya untuk status, tidak pernah dekorasi
success-600 #1B7A4B   success-50 #E9F5EE   terdeteksi, lolos validasi
info-600    #2A6BA8   info-50    #EAF1F9   perlu dikonfirmasi
warn-600    #B25D02   warn-50    #FDF3E6   parsial, data kurang
danger-600  #B3261E   danger-50  #FCEDEC   wajib dilengkapi, gagal
```

**Aturan pemakaian.**

- Maksimum **dua hue** per layar di luar neutral: brand + satu semantik dominan.
- Warna tidak pernah menjadi satu-satunya pembawa makna. Setiap badge status membawa ikon dan teks.
- Skor tidak diwarnai gradasi merah–hijau. Warna skor konstan (amber-600); yang berubah adalah label interpretasi dan posisi meter. Ini mencegah pembacaan "hijau = aman" yang bertentangan dengan status DSS.

**Dark mode** ditunda ke pasca-MVP. Bila dibuat, ink dan surface ditukar melalui token, bukan melalui override per komponen.

### Tipografi

| Peran | Font | Alasan |
|---|---|---|
| UI/sans | **Plus Jakarta Sans** | humanis-geometrik, dirancang untuk bahasa Indonesia, angka jelas |
| Display laporan | **Source Serif 4** | memberi bobot dokumen analis pada judul & ringkasan laporan |
| Mono | **JetBrains Mono** | ID run, artifact ID, kode, hash |

Serif dipakai **hanya** pada judul laporan dan paragraf ringkasan eksekutif. Sisa aplikasi memakai sans. Pencampuran di luar aturan ini membuat produk terlihat tidak konsisten.

```text
display-lg  36/44  serif 700    judul laporan
display-sm  28/36  serif 700    judul halaman alternatif
h1          28/36  sans 700
h2          22/30  sans 600     judul bagian bernomor
h3          18/26  sans 600     judul kartu
body        16/26  sans 400
body-sm     14/22  sans 400     isi kartu padat
label       13/18  sans 600     uppercase, tracking 0.06em, ink-400
caption     12/18  sans 400     sumber, timestamp, disclaimer
num-lg      48/52  sans 700     angka skor, tabular
num-md      22/28  sans 600     metric tile, tabular
```

Seluruh angka memakai `font-variant-numeric: tabular-nums`. Uang dirender `Rp 18.500` dengan pemisah titik dan spasi setelah `Rp`.

### Spasi, radius, elevasi, gerak

```text
spacing   4 8 12 16 20 24 32 40 56 80        (basis 4px)
radius    sm 8 | md 12 | lg 16 | pill 999
border    1px solid line — default untuk semua kartu
shadow    none (default)
          sm  0 1px 2px rgba(16,20,19,.05)   hanya untuk elemen mengambang
          md  0 8px 24px rgba(16,20,19,.08)  hanya modal & popover
motion    fast 120ms | base 180ms | slow 240ms, ease-out
          transisi hanya untuk opacity & transform
          prefers-reduced-motion: hilangkan translate, sisakan opacity
```

Kartu dibedakan oleh **border hairline**, bukan bayangan. Ini yang membuat layar padat tetap terbaca tenang.

### Layout

```text
container   1200px maks, padding 24 (mobile 16)
laporan     760px maks kolom baca — teks panjang tidak boleh melebar penuh
grid        12 kolom, gutter 24
breakpoint  sm 640 | md 768 | lg 1024 | xl 1280
header      64px, sticky, border-bottom hairline
```

## Inventaris komponen

Komponen ditulis sebagai satu sumber kebenaran di `components/ui`. Feature tidak boleh membuat varian lokal.

| Komponen | Fungsi | State wajib |
|---|---|---|
| `StepperNav` | breadcrumb tahap di header | upcoming, current, done, disabled |
| `Card` | kontainer dasar | default, highlighted, muted, invalid |
| `StatusBadge` | status field/kartu | detected, needs-confirmation, missing, unavailable |
| `FieldRow` | label + nilai + edit inline | read, editing, invalid, empty |
| `MetricTile` | satu angka + satuan + label | normal, undefined, loading |
| `MeterBar` | proporsi (saturasi, daya saing) | dengan label nilai wajib |
| `ScoreDisplay` | skor 0–100 + interpretasi + rule version | completed, partial, unavailable |
| `ConfidenceBlock` | evidence confidence + missing list | tinggi, sedang, rendah |
| `ProvenancePopover` | sumber, observed_at, confidence per angka | — |
| `StageProgress` | daftar stage pipeline | pending, active, done, failed, skipped |
| `AgentAvatar` | inisial + warna council (bukan foto/robot) | — |
| `AgentMessage` | satu ucapan agent | comment, challenge, revision, tool-call |
| `DebateThread` | klaim → tantangan → revisi | collapsed, expanded |
| `BallotGrid` | posisi persona sebelum/sesudah | — |
| `DistributionBar` | distribusi jawaban ballot | — |
| `RiskItem` | risiko + mitigasi + taut artifact | — |
| `ChecklistItem` | rekomendasi 30 hari | unchecked, checked |
| `EvidenceTable` | tabel bukti + limitations | — |
| `DisclaimerBanner` | disclaimer DSS wajib | — |
| `SuggestionChip` | aksi lanjutan dari agent | — |
| `EmptyState` / `ErrorState` | lihat aturan lima state | — |
| `DemoBadge` | penanda mode demo | — |

### Aturan visualisasi data

Aplikasi ini bukan dashboard analitik. Grafik dipakai hemat.

- Palet kategori maksimum 4 warna, diambil dari brand + neutral, bukan pelangi.
- Setiap bar/segmen membawa label nilai; legend saja tidak cukup.
- Sumbu selalu dimulai dari nol untuk perbandingan besaran.
- Grafik memiliki padanan tabel yang dapat dibaca screen reader.
- Distribusi ballot ditampilkan sebagai stacked bar dengan jumlah absolut, bukan pie.

## Aksesibilitas

Target WCAG 2.1 AA, sesuai non-functional traceability.

- Kontras teks ≥ 4.5:1; ink-400 di atas surface hanya untuk teks ≥ 13px semibold. Pasangan teal-700/white dan ink-900/canvas sudah diverifikasi.
- Fokus terlihat: outline 2px teal-500 dengan offset 2px. Tidak boleh `outline: none`.
- Seluruh alur dapat diselesaikan dengan keyboard, termasuk edit inline di S3 dan review OCR.
- Live region `polite` untuk perubahan stage di S5; `assertive` untuk kegagalan.
- Bahasa halaman `lang="id"`.
- Target sentuh ≥ 44px pada input transaksi dan kamera struk.
- Ikon dekoratif `aria-hidden`; ikon fungsional punya label.

---

# Bagian II — Rencana per Layar

Wireframe di bawah menetapkan hierarki dan slot informasi, bukan piksel.

## Header global

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ◈ SimuMarket AI   Upload › Analisis › [3 Review] › Pasar › Simulasi › … │
│                                              [MODE DEMO]  (?)  ⟨avatar⟩  │
└──────────────────────────────────────────────────────────────────────────┘
```

Stepper adalah navigasi, bukan dekorasi: tahap yang sudah selesai dapat diklik untuk kembali. Tahap di depan tahap aktif dinonaktifkan. `MODE DEMO` hanya muncul saat mock aktif.

## S3 — Review Bisnis

```text
                        Cek Ringkasan Bisnis
        Periksa hasil pemahaman AI sebelum simulasi dijalankan.

┌─ Ringkasan Usaha ──────────── ✓Terdeteksi ┐ ┌─ Target Pelanggan ─ ⓘPerlu dikonfirmasi ┐
│ NAMA IDE          JENIS BISNIS            │ │ SEGMEN                                  │
│ Kopi Kenangan…    F&B – Kedai Kopi        │ │ Mahasiswa & Pekerja Lepas               │
│ DESKRIPSI                                 │ │ LOKASI                                  │
│ …                                    [✎]  │ │ Bandung Selatan (radius 5 km)      [✎]  │
└───────────────────────────────────────────┘ └─────────────────────────────────────────┘

┌─ Produk & Harga ───────────── ✓Terdeteksi ┐ ┌─ Asumsi Finansial ── ⚠Perlu dilengkapi ┐
│ PRODUK      VARIAN      RANGE HARGA       │ │ MODAL AWAL      Rp 150.000.000          │
│ Es Kopi…    Reg, Large  Rp 18rb–22rb      │ │ ┌ BIAYA OPERASIONAL (BULANAN) ────────┐ │
│ …                                    [+]  │ │ │ Belum terdefinisi          [Isi →]  │ │
└───────────────────────────────────────────┘ └─┴──────────────────────────────────────┘

┌─ Kompetitor Terdekat ────────────────────────────────── ✓Terdeteksi (OSM, 3 hari lalu) ┐
│ [Kopi Janji Manis]   [Cafe Ruang Bersama]   [+ Tambah Kompetitor Lain]                 │
└────────────────────────────────────────────────────────────────────────────────────────┘

┌─ Kesiapan data ────────────────────────────────────────────────────────────────────────┐
│ 2 dari 3 input finansial wajib terisi. Tanpa biaya operasional, BEP tampil sebagai      │
│ rentang dan dimensi Kesiapan Operasional tidak dapat diskor.                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
                              [ Lengkapi Data yang Kurang ]  [ Lanjut ke Simulasi → ]
```

Perbedaan penting dari mock awal: blok **Kesiapan data** bersifat wajib. Ia menerjemahkan konsekuensi teknis data kurang menjadi kalimat yang dapat dipahami, sehingga pengguna melanjutkan dengan sadar.

Kartu `Perlu dilengkapi` memakai border danger 1px dan fill danger-50 sangat tipis pada sub-blok yang kosong saja — bukan seluruh kartu — agar layar tidak terasa alarmis.

## S5 — Simulasi live

Tiga mode tampilan, dipilih pengguna. Default: **Council**.

```text
┌ Stage ─────────────────┐ ┌ Ruang Simulasi ──────── [Feed] [Council] [Distribusi] ─────┐
│ ✓ Mengumpulkan bukti   │ │                                                             │
│ ✓ Menyusun konteks     │ │  ┌ Market Analyst · Round 1 ─────────────────────────────┐ │
│ ● Panel persona   45%  │ │  │ ⬢ Opportunity Scout                        klaim #M-04 │ │
│ ○ Menghitung finansial │ │  │ "Belum ada kedai dengan area kerja di radius 800 m."   │ │
│ ○ Menilai kelayakan    │ │  │   ↳ ⬢ Competition Skeptic              menantang #M-04  │ │
│ ○ Menyusun laporan     │ │  │     "Dua coworking menyediakan kopi. Substitusi tidak  │ │
│ ○ Memvalidasi klaim    │ │  │      dihitung." [lihat evidence E-11]                  │ │
│                        │ │  │   ↳ ⬢ Evidence Auditor                    revisi #M-04  │ │
│ ROUND 1 / 4            │ │  │     "Coverage POI tidak diketahui → confidence 0.55."  │ │
│ Cohort 16 persona      │ │  └────────────────────────────────────────────────────────┘ │
│                        │ │  ┌ Customer Persona · Round 1 ───────────────────────────┐ │
│ [Batalkan run]         │ │  │ ⬢ budget-01  komentar  "Rp 25.000 di atas batas saya" │ │
│                        │ │  │ ⬢ quality-03 like      concept-a                      │ │
│ correlation            │ │  │ ⬢ conven-02  purchase  concept-a                      │ │
│ 8ff7…868d0a       [⧉]  │ │  └────────────────────────────────────────────────────────┘ │
└────────────────────────┘ └─────────────────────────────────────────────────────────────┘
   Semua kutipan adalah respons sintetis dari agent, bukan pelanggan nyata.
```

- **Feed** — aliran `agent_action` kronologis bergaya lini masa sosial. **Default saat run berjalan**, karena inilah tampilan yang terasa hidup dan paling cepat menjelaskan "agent sedang berinteraksi" tanpa perlu dibaca.
- **Council** — thread argumentatif; `challenge_claim` selalu bersarang di bawah `claim_id` yang dirujuk. **Default setelah run selesai.** Inilah tampilan yang membuat perdebatan terbaca sebagai struktur, bukan obrolan, dan yang dipakai saat menjelaskan ke juri.
- **Distribusi** — hasil ballot: baseline (round 0) versus final, dengan panah perubahan posisi per persona. Ini yang membuktikan opinion shift terukur.

Perpindahan default dari Feed ke Council saat run selesai disengaja: selama menunggu, pengguna butuh gerak; setelah selesai, pengguna butuh struktur.

### Panel Feed — gaya lini masa sosial

Ini bagian yang mengambil rujukan visual dari MiroFish: interaksi agent dirender sebagai lini masa, bukan sebagai log.

**Anatomi kartu percakapan:**

```text
┌────────────────────────────────────────────────────────────────┐
│ ⬢BS  budget-01 · Mahasiswa hemat        R1 · komentar   00:14  │
│      ─────────────────────────────────────────────────────────  │
│      "Rp 25.000 di atas batas nyaman saya untuk kopi harian.    │
│       Kalau ada promo mingguan, saya pertimbangkan."            │
│      ─────────────────────────────────────────────────────────  │
│      ♥ 2   ↳ 1 balasan                          keberatan: harga│
└────────────────────────────────────────────────────────────────┘
    ↳ ┌──────────────────────────────────────────────────────────┐
      │ ⬢QC  quality-03 · Pencari rasa        R2 · balasan       │
      │      "Buat saya wajar kalau bijinya single origin."      │
      └──────────────────────────────────────────────────────────┘
```

Ketentuan:

| Elemen | Ketentuan |
|---|---|
| Avatar | inisial dua huruf di atas kotak radius-8 berwarna council. **Bukan** foto orang, bukan ikon robot. |
| Nama | `agent_id` teknis + label archetype yang dapat dibaca manusia |
| Meta | round + jenis action + waktu relatif sejak run mulai |
| Badge keberatan | label objection hasil ekstraksi, ditampilkan sebagai chip kecil di kanan bawah |
| Nesting | maksimum **satu** tingkat balasan. Lebih dalam dari itu dilipat menjadi "lihat 3 balasan lagi". |
| Lebar | maksimum 680px agar teks tetap terbaca |

**Rendering per jenis action** — tidak semua action layak jadi kartu penuh, kalau tidak feed akan penuh derau:

| Action | Bentuk |
|---|---|
| `create_comment` | kartu penuh dengan kutipan |
| `like_post` / `dislike_post` | baris ringkas satu tinggi, digabung: "⬢⬢⬢ 3 persona menyukai concept-a" |
| `purchase_product` | baris ringkas dengan aksen amber — satu-satunya action yang diberi warna, karena ini sinyal terpenting |
| `do_nothing` | tidak dirender per agent; diringkas di akhir round: "4 persona tidak merespons" |
| `challenge_claim` | kartu dengan garis kiri 2px dan label "menantang #M-04" |
| `run_finance_calculator` | kartu sistem bergaya mono, bukan kartu agent |

**Gerak.** Kartu baru masuk dari atas dengan fade + translate 8px, 180ms. Tidak ada bounce, tidak ada typing indicator berkedip. Auto-scroll mengikuti kartu terbaru, tetapi **berhenti begitu pengguna menggulir ke atas** dan menampilkan tombol "↓ lompat ke terbaru". Pada `prefers-reduced-motion`, kartu langsung muncul tanpa translate.

**Kepadatan.** Target 6–8 kartu terlihat sekaligus pada layar 1080p. Bila laju event lebih cepat dari ~1 per 600ms, event digabung per round agar feed tidak menjadi kabur.

### Pembeda dari lini masa sosial sungguhan

Gaya visualnya dipinjam, tetapi tiga hal sengaja **tidak** ditiru, karena akan membuat produk terbaca sebagai mainan:

1. Tidak ada tombol reaksi untuk pengguna. Pengguna adalah pengamat eksperimen, bukan peserta.
2. Tidak ada jumlah pengikut, verifikasi, atau metrik kesombongan lain.
3. Setiap kartu membawa `agent_id` teknis. Persona tidak diberi nama orang Indonesia yang terkesan nyata — ini konsekuensi langsung dari aturan di [security & AI safety](07-security-privacy-ai-safety.md).

Warna avatar council: Market = teal-700, Persona = ink-500, Finance = amber-600, Report = info-600. Empat warna ini adalah pengecualian aturan dua-hue, dan hanya berlaku pada elemen avatar 24–32px.

Disclaimer respons sintetis melekat di bawah panel, bukan di modal terpisah.

## S6 — Laporan

Kolom baca 760px, bagian bernomor, judul serif.

```text
[PREDICTION REPORT]  ID report_888bc26a43a1                    [Unduh PDF] [Variasi]

Hasil Simulasi Peluncuran Produk                                        ← serif 36
Laporan kesiapan peluncuran berdasarkan parameter pasar…                ← serif italic

01  Launch Readiness Score                                                        ⌄
    66 /100   Layak dengan mitigasi
    aturan lrs-v0.2-unvalidated · belum tervalidasi ahli
    ┌ Asisten AI Tersedia ─────────────────────┐
    │ [ Tanya AI tentang Hasil Ini → ]         │
    └──────────────────────────────────────────┘

02  Evidence Confidence                                                           ⌄
    0.58  Sedang
    Belum tersedia: observasi traffic, sampel harga pembanding (n<5)
    Skor dan confidence berdiri sendiri; confidence tidak mengubah skor.

03  Executive Summary & Pemahaman AI                                              ⌄
04  Analisis Pasar & Kompetitor                                                   ⌄
05  Proyeksi Finansial & Risiko Utama                                             ⌄
06  Peta Risiko Target                                                            ⌄
07  Rekomendasi Prioritas (Rencana 30 Hari)                                       ⌄
08  Bukti & Keterbatasan                                                          ⌄
    tabel evidence: metrik · nilai · sumber · diambil · confidence
    ┌────────────────────────────────────────────────────────────────────┐
    │ Hasil adalah alat bantu keputusan, bukan jaminan keberhasilan usaha.│
    └────────────────────────────────────────────────────────────────────┘
```

Bagian 02 dan 08 ditambahkan terhadap mock awal karena keduanya wajib menurut F-16 dan aturan provenance. Keduanya tidak boleh collapsed secara default.

Angka finansial pada bagian 05 memakai `ProvenancePopover`. Bila `contribution_margin <= 0`, BEP dirender sebagai "tidak terdefinisi" dengan penjelasan, bukan `∞` atau `-`.

### Varian `partial`

```text
┌ ⚠ Laporan parsial ─────────────────────────────────────────────────────┐
│ Simulasi persona tidak tersedia pada run ini (batas waktu penyedia AI). │
│ Analisis pasar, finansial, dan skor tetap dihitung deterministik.       │
│ Dimensi Potensi Permintaan tidak dapat dinilai (bobot 25%).             │
│                                    [ Ulangi tahap simulasi ]            │
└────────────────────────────────────────────────────────────────────────┘
```

Bagian yang gagal tetap muncul di daftar isi dengan badge `Tidak tersedia` dan alasan singkat.

## S7 — Diskusi

Dua kolom: konteks run (kiri, sticky) dan percakapan (kanan).

```text
┌ Kedai Kopi Senja ───────┐ ┌ Tanya AI tentang Peluncuranmu ────────────────────────┐
│ SKOR KELAYAKAN          │ │  [Pakar Pemasaran] [Ahli Finansial] [Analis Risiko]   │
│ ▓▓▓▓▓▓▓░░░  66/100      │ │                                                        │
│ Target   Mahasiswa      │ │                        ┌ ANDA ───────────────────────┐ │
│ Harga    Rp 25.000      │ │                        │ "Bagaimana jika promo…"     │ │
│ ┌ Insight Utama ──────┐ │ │                        └─────────────────────────────┘ │
│ │ Potensi tumbuh di   │ │ │  ┌ Ahli Finansial · council finance ─────────────────┐ │
│ │ bulan ke-3, waspadai│ │ │  │ Margin kotor minggu pertama turun ke 15%.         │ │
│ │ arus kas bulan 1.   │ │ │  │ ⌘ dihitung oleh finance-calculator · call #FC-118 │ │
│ └─────────────────────┘ │ │  │ Rekomendasi: batasi kuota harian promo.           │ │
│                         │ │  │ [Lihat Simulasi Arus Kas] [Jalankan sbg Variasi]  │ │
│ ↺ Diskusi Sebelumnya    │ │  └───────────────────────────────────────────────────┘ │
│ • Optimalisasi biaya    │ │  ┌ Tanyakan hal lain…                            [→] ┐ │
│ • Strategi branding     │ │  └───────────────────────────────────────────────────┘ │
└─────────────────────────┘ └────────────────────────────────────────────────────────┘
   AI dapat memberi hasil berbeda tergantung asumsi yang Anda berikan.
```

Perubahan terhadap mock awal: badge `VERIFIED AGENT` diganti **atribusi tool call** (`⌘ dihitung oleh finance-calculator · call #FC-118`). "Verified" mengklaim kebenaran yang tidak dapat dijamin; atribusi tool call menyatakan fakta yang dapat diaudit dan justru lebih kuat sebagai bukti teknis. Angka tanpa atribusi tool call tidak dirender.

## Layar Loop 2

**Input transaksi manual** — satu baris fokus: produk (chip pencarian), jumlah (stepper), harga (terisi otomatis dari master, dapat ditimpa), channel. Enter menyimpan dan mengosongkan form tanpa memindahkan fokus.

**Review OCR struk** — split view.

```text
┌ Gambar struk ──────────┐ ┌ Hasil ekstraksi — periksa sebelum simpan ────────────┐
│                        │ │ Merchant   Warung Contoh                    0.94  ✓  │
│   [foto struk,         │ │ Tanggal    5 Agu 2026 12:10                 0.81  ⓘ  │
│    dapat di-zoom]      │ │ ─ Item ──────────────────────────────────────────────│
│                        │ │ RICE BOWL AYM → [Rice Bowl Ayam ▾]  2 × Rp 18.000    │
│                        │ │                                             0.76  ⓘ  │
│                        │ │ ─────────────────────────────────────────────────────│
│                        │ │ Total tercatat Rp 36.000 · Total item Rp 36.000  ✓   │
└────────────────────────┘ └──────────────────── [Simpan sebagai Transaksi] ──────┘
```

Field confidence < 0.85 mendapat ikon `ⓘ` dan urutan fokus lebih awal. Mismatch total memunculkan konfirmasi eksplisit.

---

# Bagian III — Rencana Mock Klik-Melalui

## Tujuan dan batas

**Tujuan.** Prototipe klik-melalui yang memperlihatkan **alur aplikasi dari sisi pengguna**: urutan layar, bentuk informasi di tiap layar, dan bagaimana satu layar berpindah ke layar berikutnya. Dipakai untuk menyepakati desain, merekam demo, dan uji usabilitas awal.

**Bukan tujuan.** Mock tidak menghitung apa pun, tidak memanggil AI, tidak memvalidasi kontrak, dan tidak menjadi fondasi arsitektur backend. Seluruh angka yang tampil adalah teks yang sudah ditulis sebelumnya.

Konsekuensi yang disengaja: mock ini **disposable**. Yang bertahan ke produksi adalah Bagian I dan II — token, komponen, dan layout. Cara data mengalir di mock boleh dibuang seluruhnya saat backend nyata datang.

## Yang dibuat dan yang tidak

| Dibuat | Tidak dibuat |
|---|---|
| Seluruh layar S1–S7 dapat diklik berurutan | Perhitungan finansial atau skor |
| Data contoh disimpan di file terpisah | Validasi skema, Zod, contract test |
| Layar simulasi bergerak mengikuti skrip | SSE, transport interface, dua implementasi |
| Tombol "Putar Otomatis" menjalankan seluruh alur | Clock virtual, PRNG berseed, determinisme |
| Dua varian akhir: normal dan parsial | Enam skenario dan DSL skenario |
| Badge `MODE DEMO` | Env flag, tree-shaking, aturan lint |
| Edit inline di layar Review terasa nyata | Penyimpanan permanen |

Bila kelak mock perlu dinaikkan menjadi frontend produksi, barulah transport interface, skema, dan pemisahan build dipertimbangkan. Pada tahap ini semuanya adalah biaya tanpa hasil.

## Cara kerja

Sederhana dan sengaja begitu:

1. **Data contoh ada di file sendiri**, bukan di dalam JSX. Alasannya praktis, bukan arsitektural: mengubah angka laporan atau menambah persona cukup mengedit satu file, tanpa menyentuh komponen. Ini yang membuat iterasi desain cepat.
2. **Satu state sederhana** menyimpan langkah aktif dan hasil edit pengguna. React context atau satu store kecil sudah cukup. Tidak perlu data-fetching library.
3. **Layar simulasi memutar array langkah** dengan jeda. Setiap langkah berisi stage, persen, dan satu baris aktivitas agent. Komponen hanya merender apa yang sudah lewat.
4. **Tombol "Putar Otomatis"** memajukan layar satu per satu secara otomatis sampai laporan.

## Struktur file

```text
src/
  app/                    # route per layar
  components/             # komponen dari Bagian I
  demo/
    data/
      profile.ts          # isi layar Review Bisnis
      simulation.ts       # skrip langkah layar Simulasi
      report.ts           # isi laporan
      discussion.ts       # pertanyaan + jawaban yang sudah ditulis
      transactions.ts     # data transaksi & struk
    useDemoFlow.ts        # langkah aktif, next(), autoplay
```

## Skrip layar simulasi

Bentuknya cukup seperti ini:

```ts
// demo/data/simulation.ts
export const langkah = [
  { ms: 800, stage: 'Mengumpulkan bukti lokal', persen: 10 },

  { ms: 700, stage: 'Mengumpulkan bukti lokal', persen: 18,
    aktivitas: { council: 'market', agent: 'market-scout-01',
      label: 'Opportunity Scout', round: 0, action: 'comment', klaim: 'M-04',
      teks: 'Belum ada kedai dengan area kerja khusus di radius 800 m.' } },

  { ms: 900, stage: 'Panel persona berjalan', persen: 30,
    aktivitas: { council: 'market', agent: 'market-skeptic-01',
      label: 'Competition Skeptic', round: 1, action: 'challenge', refs: 'M-04',
      teks: 'Dua coworking menyediakan kopi; substitusi belum dihitung.' } },

  { ms: 700, stage: 'Panel persona berjalan', persen: 38,
    aktivitas: { council: 'persona', agent: 'budget-01',
      label: 'Mahasiswa hemat', round: 1, action: 'comment', keberatan: 'harga',
      teks: 'Rp 25.000 di atas batas nyaman saya untuk kopi harian.' } },

  { ms: 500, stage: 'Panel persona berjalan', persen: 43,
    aktivitas: { council: 'persona', round: 1, action: 'like',
      agents: ['quality-03', 'social-02', 'conven-04'], target: 'concept-a' } },

  { ms: 600, stage: 'Panel persona berjalan', persen: 48,
    aktivitas: { council: 'persona', agent: 'conven-02',
      label: 'Komuter terburu-buru', round: 1, action: 'purchase', target: 'concept-a' } },

  { ms: 500, stage: 'Panel persona berjalan', persen: 52,
    aktivitas: { council: 'persona', round: 1, action: 'ringkasan',
      teks: '4 persona tidak merespons pada round ini.' } },

  { ms: 900, stage: 'Menghitung skenario finansial', persen: 62,
    aktivitas: { council: 'finance', action: 'tool',
      teks: 'finance-calculator · BEP bulan ke-4 · margin kotor 35%' } },

  { ms: 800, stage: 'Menilai kelayakan',  persen: 74 },
  { ms: 900, stage: 'Menyusun laporan',   persen: 88 },
  { ms: 600, stage: 'Selesai',            persen: 100 },
];
```

Field `action` menentukan bentuk kartu sesuai tabel rendering di Bagian II: `comment` jadi kartu penuh, `like` jadi baris gabungan, `purchase` jadi baris beraksen amber, `tool` jadi kartu sistem mono. Menambah percakapan berarti menambah baris di sini — tidak ada file lain yang perlu disentuh.

## Dua varian akhir

Cukup dua, dipilih lewat tombol kecil di layar Simulasi atau parameter URL `?hasil=parsial`:

| Varian | Yang ditunjukkan |
|---|---|
| Normal | laporan lengkap dengan skor 66 |
| Parsial | simulasi persona gagal, laporan tetap tampil dengan bagian bertanda tidak tersedia |

Varian parsial layak dibuat sejak awal meski menambah sedikit kerja: ia adalah satu-satunya cara memperlihatkan bahwa produk tetap berguna saat AI gagal, dan itu poin cerita yang kuat saat demo.

## Penanda demo

Badge `MODE DEMO` di header dan tulisan `DATA CONTOH` pada tampilan PDF. Dua baris kerja, dan memastikan tangkapan layar mock tidak pernah salah dibaca sebagai hasil analisis nyata.

## Urutan pembangunan

| Langkah | Keluaran |
|---|---|
| 1 | Token warna/huruf + komponen dasar dari Bagian I |
| 2 | Shell aplikasi, header, dan stepper yang bisa diklik |
| 3 | Layar Review Bisnis dengan edit inline dan tiga status badge |
| 4 | Layar Simulasi yang memutar skrip |
| 5 | Layar Laporan, termasuk varian parsial |
| 6 | Layar Diskusi dengan jawaban yang sudah ditulis |
| 7 | Layar transaksi dan review struk |
| 8 | Tombol "Putar Otomatis" |

## Selesai bila

- [ ] Seluruh layar S1–S7 dapat dilalui dengan klik, berurutan dan mundur.
- [ ] Satu klik "Putar Otomatis" menyelesaikan alur tanpa intervensi.
- [ ] Varian parsial dapat ditampilkan.
- [ ] Laporan memuat bagian Evidence Confidence, Bukti & Keterbatasan, dan disclaimer.
- [ ] Badge `MODE DEMO` tampil.
- [ ] Berjalan hanya dengan `npm run dev`, tanpa backend.
