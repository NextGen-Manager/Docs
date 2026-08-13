# Dashboard dan App Shell

Dokumen ini merancang layar utama pengguna setelah login: apa yang ada di dalamnya, kenapa, dan bagaimana bentuknya berubah mengikuti keadaan pengguna.

Alur per layar ada di [workflow aplikasi](12-application-workflow.md); token dan komponen ada di [UI system](13-ui-system-and-mock-plan.md). Dokumen ini mengisi bagian yang belum dijawab keduanya: **bagaimana pengguna memakai produk ini dari hari ke hari**, bukan sekali jalan.

## Kenapa dokumen ini perlu

Demo klik-melalui memperlihatkan dua alur dari ujung ke ujung. Itu membuktikan fitur-fiturnya tersambung, tetapi tidak menjawab pertanyaan yang berbeda: apa yang dilihat pengguna saat membuka aplikasi untuk kedelapan kalinya, ketika ia tidak sedang menjalankan alur apa pun.

Alur punya awal dan akhir. Produk tidak. Dashboard adalah tempat pengguna berada di antara alur.

## Yang sudah dikunci dokumen lain

| Sumber | Ketentuan |
|---|---|
| Proposal F-02 (Must) | Dashboard menampilkan ringkasan aktivitas, pilihan modul, dan riwayat penggunaan |
| Proposal §6.2 | Ringkasan aktivitas, akses tiga modul, skor terakhir, riwayat analisis |
| Proposal §7.1 | Tiga akses modul dalam card layout, ringkasan skor terakhir, notifikasi insight terbaru |
| [Kontrak API](06-api-contract.md) | `GET /v1/dashboard` mengembalikan ringkasan aktivitas, modul, score terakhir, dan insight |
| Proposal §5.11 | Kedua journey dimulai dari dashboard |

Jadi keberadaannya tidak diperdebatkan. Yang dirancang di sini adalah bentuk dan perilakunya.

---

## Analisis: siapa yang datang, dan untuk apa

### Dua persona punya ritme yang berbeda jauh

Ini pembeda terpenting yang belum tertangkap di dokumen mana pun.

| | Calon pengusaha | Pelaku usaha berjalan |
|---|---|---|
| Frekuensi buka | beberapa kali, lalu berhenti | **setiap hari** |
| Bentuk pemakaian | proyek: ada awal dan akhir | kebiasaan: tidak ada akhir |
| Tujuan tiap kunjungan | membandingkan pilihan, mengambil keputusan | mencatat penjualan hari ini |
| Yang ia cari di layar | skor dan rekomendasi terakhir | apakah hari ini sudah dicatat |

Dashboard tunggal yang melayani keduanya dengan tampilan sama akan buruk untuk keduanya. Layar yang dirancang untuk "ini tiga analisis tersimpanmu" tidak mirip dengan layar yang dirancang untuk "kamu belum mencatat hari ini".

### Risiko produk terbesar ada di gerbang tujuh hari

Seluruh nilai modul Transaction Management terkunci di balik tujuh hari pencatatan. Pengguna yang mencatat tiga hari lalu berhenti mendapat **nol** — tidak ada insight, tidak ada tren, tidak ada peringkat produk. Ia hanya merasakan biayanya, tidak pernah merasakan manfaatnya.

Proposal sendiri menunjukkan kenapa ini bukan risiko teoretis:

- 70% UMKM masih kesulitan melakukan pencatatan transaksi (ANTARA, 2025);
- hanya 26% pelaku usaha makanan dan minuman yang sudah mendigitalisasi proses bisnisnya (BCG & Telkom Indonesia, 2022);
- proposal §6.5 sendiri menulis filosofinya: *sistem harus lebih mudah dari mencatat di buku tulis, bukan lebih rumit*.

**Karena itu, tugas nomor satu dashboard bagi persona kedua adalah membawa pengguna sampai hari ketujuh.** Kalau dashboard gagal di situ, seluruh modul analitik tidak pernah terpakai, dan klaim "insight dari data penjualan nyata" tidak pernah terbukti.

### Jembatan antarpersona belum ada yang merancang

Calon pengusaha yang menjalankan Market Analysis lalu benar-benar membuka usahanya **berubah menjadi persona kedua**. Tidak ada dokumen yang menangani transisi itu.

Yang tersedia untuk menjembatani sudah ada di produk: laporan mengeluarkan **rekomendasi prioritas 30 hari**. Kalau rekomendasi itu hanya teks di dalam PDF, produk berhenti sebagai kalkulator sekali pakai. Kalau dibawa ke dashboard sebagai daftar tugas berjalan, pengguna punya alasan kembali di masa antara "sudah menganalisis" dan "sudah berjualan" — masa yang bisa berminggu-minggu.

---

## Keputusan bentuk

### App shell, bukan halaman menu

Referensi bentuk yang dipakai adalah aplikasi operasional dengan **sidebar tetap di kiri** dan area kerja di kanan.

Yang diambil:

- **navigasi tetap terlihat**, jadi pengguna berpindah modul tanpa kembali ke halaman menu lebih dulu;
- **penanda jumlah pada item navigasi**, sehingga hal yang butuh perhatian terlihat tanpa diklik;
- **satu area kerja utama** yang berganti isi, bukan halaman yang berganti seluruhnya.

Yang **tidak** diambil:

- kepadatan tabel, facet filter, dan bahasa kueri — itu untuk operator teknis yang bekerja seharian di satu layar;
- tema gelap sebagai bawaan;
- banyak metrik sekaligus di layar pertama.

Pengguna kita pemilik warung yang membuka aplikasi di sela melayani pembeli. Struktur aplikasinya boleh meniru; kepadatannya tidak.

### Card layout tetap dipakai, tapi hanya di keadaan kosong

Proposal §7.1 menyebut tiga akses modul dalam card layout. Itu tepat untuk pengguna yang **baru pertama masuk** dan perlu tahu produk ini punya tiga bagian.

Bagi pengguna yang sudah punya data, card layout adalah **menu** — dan menu dibuat ketika sistem tidak tahu pengguna datang untuk apa. Sesudah ada data, sistem sebenarnya tahu.

Karena itu: kartu tiga modul dipertahankan sebagai isi keadaan awal, lalu digantikan area kerja adaptif begitu ada data. F-02 dan §7.1 tetap terpenuhi.

---

## Struktur layar

```text
┌──────────────┬──────────────────────────────────────────────┐
│ SimuMarket   │  Beranda                          [profil]   │
│ ▸ Beranda    │  ┌────────────────────────────────────────┐  │
│              │  │  BLOK UTAMA KOMPOSIT                  │  │
│              │  │  merangkum seluruh usaha              │  │
│ ANALISIS     │  └────────────────────────────────────────┘  │
│ ▸ Market   3 │                                              │
│ ▸ Riwayat    │  Rencana 30 Hari              2 dari 5 ✓     │
│              │  ☐ Hubungi pemasok cadangan                  │
│ USAHA        │  ☐ Negosiasi harga kemasan                   │
│ ▸ Transaksi ●│                                              │
│ ▸ Analitik   │  ┌─ Insight terbaru ─┐ ┌─ Edukasi ────────┐  │
│ ▸ Produk   5 │  │ Es Kopi menopang  │ │ 3 dari 4 topik   │  │
│              │  │ 54% pendapatan    │ │ [Lanjutkan]      │  │
│ BELAJAR      │  └───────────────────┘ └──────────────────┘  │
│ ▸ Edukasi 3/4│                                              │
│              │  Analisis tersimpan                          │
│ ▸ Laporan    │  Tebet 66 · Depok 54 · Bekasi 71             │
└──────────────┴──────────────────────────────────────────────┘
```

Sidebar tidak memiliki pemilih usaha global. Beranda menampilkan komposit seluruh usaha. Scope usaha dipilih di dalam destination *Transaksi*, *Analitik*, dan *Produk* supaya konteksnya terlihat tepat di tempat data digunakan. Modul *Analisis* tetap tidak terikat usaha karena analisis dapat dijalankan sebelum usaha ada.

Sidebar dikelompokkan menurut **maksud pengguna**, bukan menurut nama modul di proposal: *Analisis* untuk memutuskan, *Usaha* untuk menjalankan, *Belajar* untuk memahami. Pengguna tidak berpikir "saya mau modul 3".

Setiap item navigasi membuka destination mandiri di dalam app shell. *Transaksi* dan *Produk* menyediakan tab per usaha. *Analitik* dimulai dari komposit seluruh usaha dan menyediakan rincian per usaha. *Riwayat Analisis* dan *Laporan* masing-masing membuka daftar riwayat terlebih dahulu; detail dipilih dari daftar tersebut dan tidak menjalankan autoplay journey.

Pada layar sempit sidebar menjadi bilah bawah berisi empat tujuan utama, karena modul transaksi dipakai sambil berdiri.

Untuk kasir, sidebar hanya merender *Dashboard* dan *Catat Transaksi*. Kelompok *Analisis*, destination pengelolaan usaha, dan *Belajar* tidak dirender. Tab usaha juga tidak muncul karena akses kasir terikat satu usaha.

---

## Blok utama: empat keadaan

Hanya satu yang tampil, ditentukan keadaan pengguna. Ini inti rancangannya — dashboard menjawab *"apa yang perlu saya lakukan sekarang"*, bukan menyodorkan seluruh kemungkinan.

### Keadaan A — belum ada apa-apa

Pengguna baru mendaftar.

```text
Mulai dari mana?

Belum buka usaha            Sudah punya usaha
Uji kelayakan lokasi        Catat penjualan harian
dan harga dulu.             untuk lihat polanya.
[ Mulai Analisis ]          [ Daftarkan Produk ]
```

Dua pilihan, bukan tiga kartu modul. Edukasi tidak ditawarkan di sini karena ia gerbang di tengah alur, bukan tujuan awal — menawarkannya di depan justru membuat orang mengira harus belajar dulu sebelum boleh mencoba.

### Keadaan B — sudah menganalisis, usaha belum jalan

```text
Kopi Senja · Tebet                              66/100
Layak dengan mitigasi                    lrs-v0.2-unvalidated

Langkah berikutnya dari laporanmu          2 dari 5 selesai
☑ Kumpulkan tiga kuotasi sewa
☐ Hubungi pemasok gula aren cadangan
☐ Turunkan biaya kemasan 10%

[ Sudah buka usaha? Mulai catat penjualan → ]
```

Checklist 30 hari jadi isi utama. Tombol terakhir adalah **jembatan antarpersona** yang selama ini hilang: ia mengubah pengguna dari mode merencanakan ke mode menjalankan, tepat saat ia siap.

### Keadaan C — usaha jalan, data belum cukup

**Keadaan paling menentukan.** Di sinilah pengguna paling mungkin berhenti.

```text
Hari ini belum ada penjualan tercatat

[ Catat Sekarang ]           kurang dari 10 detik

Menuju analitik          ▓▓▓▓▓░░  5 dari 7 hari
Dua hari lagi kamu bisa melihat produk terlaris,
jam paling ramai, dan tren pendapatanmu.
```

Tiga hal disengaja:

1. **Yang ditampilkan adalah kekurangannya, bukan capaiannya.** "Kurang 2 hari lagi" mendorong; "sudah 5 hari" terasa selesai.
2. **Imbalannya disebut konkret** — produk terlaris, jam ramai, tren. Bukan "buka analitik", yang tidak berarti apa-apa bagi orang yang belum pernah melihatnya.
3. **Janji sepuluh detik ditulis di tombol**, karena hambatan sebenarnya adalah persepsi bahwa mencatat itu merepotkan.

Kalau sudah dicatat hari ini, blok berganti jadi ringkasan hari ini plus progres, dengan nada yang mengakui.

### Keadaan D — usaha jalan, data cukup

```text
Hari ini                    14 transaksi · Rp 486.000
[ Catat Penjualan ]

Insight terbaru                          7 hari terakhir
Es Kopi Susu menopang 54% pendapatan.
Ketergantungan satu produk membuat penjualan rapuh.
[ Lihat Analitik → ]
```

Mencatat tetap aksi utama karena tetap tugas hariannya. Insight naik ke permukaan memenuhi §7.1 (*notifikasi insight terbaru*) dan F-12, tanpa memindahkan grafik ke dashboard.

---

## Blok pendukung

Muncul di bawah blok utama, urutannya tetap:

| Blok | Isi | Memenuhi |
|---|---|---|
| Rencana 30 hari | checklist dari laporan terakhir, bisa dicentang | menjembatani dua persona |
| Insight terbaru | satu kartu, insight paling menonjol | F-12, §7.1 |
| Edukasi | progres topik, satu tautan lanjut | F-08 |
| Analisis tersimpan | daftar ringkas: lokasi, skor, tanggal | F-02 (riwayat), F-14 |

Analisis tersimpan tampil sebagai baris, bukan kartu besar — bagi calon pengusaha yang membandingkan tiga lokasi, membandingkan lebih mudah kalau angkanya sejajar.

---

## Yang sebaiknya tidak dibangun

- **Dashboard analitik penuh grafik.** Grafik tetap di `/transaksi/analitik`. Halaman pertama yang dilihat pemilik warung jam enam pagi bukan tempat lima diagram.
- **Metrik kesombongan** — total kunjungan, jumlah analisis dijalankan. Tidak mengubah keputusan apa pun.
- **Angka yang dihitung frontend.** Seluruh ringkasan datang dari `GET /v1/dashboard`. Aturan pertama workspace tetap berlaku di layar ini.
- **Skor tanpa keterangan versi.** Di mana pun skor tampil, `rule_version` ikut, sesuai aturan provenance.
- **Notifikasi yang memaksa.** Pengingat mencatat boleh ada, tetapi sebagai keadaan di layar — bukan lonceng merah yang menghukum.

---

## Kontrak data

`GET /v1/dashboard` perlu mengembalikan cukup informasi untuk menentukan keadaan tanpa panggilan tambahan:

```json
{
  "keadaan": "usaha_berjalan_data_kurang",
  "analisis_terakhir": {
    "id": "uuid",
    "nama": "Kopi Senja",
    "area": "Tebet, Jakarta Selatan",
    "skor": 66,
    "interpretasi": "Layak dengan mitigasi",
    "rule_version": "lrs-v0.2-unvalidated",
    "dibuat": "2026-08-11T02:30:00Z"
  },
  "rencana_30_hari": { "total": 5, "selesai": 2, "berikutnya": [] },
  "transaksi": {
    "hari_tercatat": 5,
    "ambang": 7,
    "hari_ini": { "jumlah": 0, "pendapatan_idr": 0 }
  },
  "insight_terbaru": null,
  "edukasi": { "total": 4, "selesai": 3 },
  "riwayat_analisis": []
}
```

Field `keadaan` dihitung backend, bukan disimpulkan frontend, supaya aturan penentuannya punya satu tempat dan bisa diuji.

Perubahan bentuk endpoint ini menyentuh kontrak yang sudah tertulis di dokumen 06 — perbarui dokumen itu pada commit yang sama.

---

## Urutan pembangunan

| # | Pekerjaan | Catatan |
|---|---|---|
| 1 | App shell: sidebar, area kerja, bilah bawah untuk layar sempit | memblokir seluruh layar lain |
| 2 | Blok utama keadaan C | keadaan dengan risiko putus tertinggi |
| 3 | Blok utama keadaan A dan D | melengkapi jalur masuk dan jalur harian |
| 4 | Rencana 30 hari + keadaan B | jembatan antarpersona |
| 5 | Insight terbaru, edukasi, analisis tersimpan | blok pendukung |

Keadaan C didahulukan karena di situlah pengguna paling mungkin berhenti, dan karena seluruh nilai modul transaksi bergantung padanya.

---

## Keputusan yang sudah diambil

Ditetapkan product owner pada 9 Agustus 2026.

### 1. Satu akun boleh punya banyak usaha

Pengguna dapat mengelola lebih dari satu usaha. Dashboard menyesuaikan.

Konsekuensi rancangan:

- **Tidak ada pemilih usaha global di sidebar.** Beranda mengembalikan komposit seluruh usaha. Transaksi, analitik, dan produk menerima `business_id` dari pilihan lokal pada destination masing-masing.
- **Keadaan B berubah maknanya.** Pertanyaannya bukan lagi "analisis mana yang jadi usahamu", melainkan "analisis ini mau dijadikan usaha?". Satu analisis dapat dinaikkan menjadi usaha; sisanya tetap tersimpan sebagai skenario pembanding.
- **Modul analisis tidak terikat usaha.** Analisis bisa dijalankan sebelum usaha ada, karena memang itu gunanya. Yang terikat usaha adalah transaksi, produk, dan analitik.
- `business_profile` berelasi satu-ke-banyak terhadap user; seluruh query transaksi dan analitik di-scope oleh `business_id`, bukan hanya `user_id`.

### 2. Tidak ada notifikasi untuk sementara

Tidak ada email maupun notifikasi browser di MVP.

Konsekuensi yang perlu disadari: **gerbang tujuh hari kehilangan satu-satunya pendorong dari luar.** Kalau pengguna tidak membuka aplikasi, tidak ada apa pun yang mengingatkannya. Artinya keadaan C pada dashboard bukan sekadar salah satu tampilan — ia menjadi **satu-satunya alat** yang dimiliki produk untuk membawa pengguna sampai hari ketujuh. Karena itu ia tetap dikerjakan lebih dulu.

### 3. Dua peran: pemilik dan kasir

Kasir ada karena ia yang merekam transaksi. Aksesnya dibatasi pada pekerjaan itu.

Pembagian hak akses berikut dikonfirmasi product owner pada 9 Agustus 2026.

| Kemampuan | Pemilik | Kasir |
|---|---|---|
| Mencatat transaksi | ya | ya |
| Melihat daftar produk beserta harga jual | ya | ya |
| Melihat HPP dan marjin per produk | ya | **tidak** |
| Menambah/mengubah produk dan harga | ya | tidak |
| Melihat ringkasan penjualan hari ini | ya | ya |
| Melihat analitik mingguan, peringkat produk, sebaran jam | ya | tidak |
| Melihat Launch Readiness Score dan laporan analisis | ya | tidak |
| Melihat modal awal dan proyeksi finansial | ya | tidak |
| Menjalankan Market Analysis | ya | tidak |
| Modul edukasi | ya | tidak |
| Mengundang atau mencabut akses kasir | ya | tidak |

Dua alasan pembatasan yang perlu dipegang:

- **HPP dan marjin adalah data biaya**, bukan data operasional. Kasir butuh harga jual untuk mencatat; ia tidak butuh tahu untungnya berapa.
- **Skor dan proyeksi finansial menyangkut keputusan modal pemilik.** Membocorkannya ke seluruh karyawan mengubah sifat produk tanpa pemilik pernah memilih itu.

Konsekuensi rancangan:

- Sidebar kasir hanya memuat *Dashboard* dan *Catat Transaksi*. Daftar produk beserta harga jual tersedia di dalam form pencatatan, tetapi destination *Produk* tidak dirender karena pengelolaan katalog tetap milik pemilik.
- Blok utama untuk kasir hanya punya dua keadaan: sudah mencatat hari ini, atau belum. Progres tujuh hari, rencana 30 hari, dan insight tidak tampil.
- **Undangan kasir memakai kode**, ditetapkan product owner 13 Agustus 2026. Pemilik menghasilkan kode sekali pakai berumur tujuh hari, kasir mendaftar sendiri lalu menukarkannya, dan aksesnya terikat satu `business_id`. Rinciannya di [PRD pembangunan MVP](16-prd-mvp.md).
- Pembatasan ditegakkan di **repository layer backend**, bukan hanya dengan menyembunyikan menu. Aturan ini sudah tertulis di `AGENTS.md` backend.

## Yang masih perlu diputuskan

1. **Batas jumlah usaha per akun.** Tanpa batas, satu akun bisa membuat ratusan usaha dan menghabiskan kuota analisis. Karena subscription dikeluarkan dari MVP pada 13 Agustus 2026, batas ini tidak lagi dapat dikaitkan dengan model freemium proposal §5.10 dan harus berupa angka tetap.
