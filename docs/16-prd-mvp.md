# PRD Pembangunan MVP

Dokumen ini adalah rencana pembangunan aplikasi sebenarnya, backend dan frontend, dari keadaan sekarang sampai siap dipakai pengguna. Ditulis 13 Agustus 2026.

Dokumen lain menjawab *apa* dan *kenapa*. Dokumen ini menjawab **urutan, batas, dan kapan sesuatu boleh disebut selesai**. Kalau bertentangan dengan `01`–`15`, dokumen tersebut yang menang dan PRD ini yang diperbaiki.

## Keadaan awal

| Repository | Keadaan |
|---|---|
| `Docs` | `01`–`15` lengkap, tiga ADR |
| `SimuMarketAI` (frontend) | Landing sinematik, `/login` belum tersambung, demo klik-melalui lengkap di `/demo/*` |
| `SimuMarketAI-BE` | Belum ada kode. Hanya `README.md` dan `AGENTS.md` |

Backend nol adalah fakta terpenting dalam menyusun urutan di bawah. Tidak ada legacy yang harus dihormati, jadi urutan boleh dipilih murni berdasarkan risiko dan ketergantungan.

---

## Batas scope

### Masuk MVP

Seluruh requirement Must pada [tabel traceability](01-technical-requirements-traceability.md): F-01 sampai F-13 dan F-16. F-14 dan F-15 berstatus Should dan dikerjakan hanya bila waktu tersisa.

### Tidak masuk MVP

| Yang dikeluarkan | Alasan |
|---|---|
| **Subscription, billing, dan paywall** | Ditetapkan product owner 13 Agustus 2026. Tidak ada plan, tidak ada batas kuota berbayar, tidak ada integrasi pembayaran. Halaman `/demo/langganan` tetap ada sebagai permukaan demo, bukan fitur |
| Notifikasi email dan browser | Keputusan product owner 9 Agustus 2026 |
| Aplikasi mobile native | Di luar proposal |
| Integrasi POS dan marketplace | `docs/09`, kolom *Later* |
| RAG/GraphRAG di atas pgvector | `docs/09`, kolom *Later*. `pgvector` tetap disiapkan di skema, tetapi tidak dipakai untuk retrieval MVP |

Menuliskan yang tidak dibangun sama pentingnya dengan menuliskan yang dibangun. Tanpa daftar ini, subscription akan menyelinap masuk lewat "sekalian saja".

### Demo dibekukan

**Kemampuan demo tidak boleh berubah dari keadaan sekarang. Ini batas keras, bukan preferensi.**

Yang dibekukan:

```text
src/app/demo/**
src/demo/**
```

Aturan pembekuan:

- Tidak ada layar demo baru, tidak ada langkah baru pada journey, tidak ada data contoh baru.
- Perubahan yang diizinkan hanya tiga: perbaikan bug yang membuat demo gagal jalan, perbaikan aksesibilitas, dan penyesuaian yang dipaksa oleh kenaikan versi dependency.
- Aplikasi nyata **tidak boleh mengimpor apa pun** dari `src/demo/`. Aturan ini sudah tertulis di `AGENTS.md` frontend; sekarang ia juga menjadi batas rilis.
- Sebaliknya, demo boleh terus memakai `src/components/ui/` dan `src/lib/`. Kalau primitif di sana berubah bentuk, demo wajib ikut diverifikasi masih tampil benar.

Alasannya sederhana: demo adalah satu-satunya artifact yang saat ini dapat ditunjukkan kepada juri. Membangun aplikasi nyata tidak boleh merusaknya, dan memperbaiki demo tidak boleh menyita waktu pembangunan.

---

## Branch dan kebijakan deployment

Product owner menetapkan 13 Agustus 2026: **tidak ada deployment aplikasi nyata sampai seluruhnya selesai. Yang live hanya demo.**

### Peran tiap branch

Berlaku di kedua repository kode.

| Branch | Peran |
|---|---|
| `dev` | **Seluruh pembangunan aplikasi nyata.** Semua pekerjaan PRD ini masuk ke sini |
| `demo` | Demo yang dibekukan. **Satu-satunya branch yang men-deploy production** |
| `main` | Tidak dipakai selama masa pembangunan |

Backend hanya memakai `dev`; ia tidak punya artifact yang di-deploy sampai Fase 6.

### Penegakan

GitHub Actions men-deploy production **hanya dari push ke `demo`**. Trigger `main` sudah dicabut. Artinya tidak ada jalur teknis yang memungkinkan aplikasi setengah jadi terbit tanpa seseorang sengaja mendorongnya ke `demo`.

Perbaikan yang diizinkan pada demo (lihat aturan pembekuan di atas) dikerjakan langsung di `demo` atau di-cherry-pick ke sana. Itu satu-satunya hal yang menyentuh produksi selama masa pembangunan.

### Konsekuensi yang diterima

`/login` pada rilis demo adalah form yang belum tersambung ke apa pun. Selama Fase 1 belum selesai dan `demo` belum disegarkan, keadaan itu tetap live. Ini diterima karena autentikasi nyata adalah pekerjaan pertama yang dikerjakan, bukan pekerjaan yang ditunda. Begitu Fase 1 lulus, `demo` disegarkan satu kali agar halaman masuk benar-benar bekerja.

---

## Keputusan urutan: RBAC atau OASIS lebih dulu

Pertanyaan ini mengandung asumsi yang perlu dibongkar dulu: seolah keduanya bersaing untuk slot yang sama. Sebenarnya tidak.

### Yang berbeda dari keduanya

| | RBAC dan identity | Engine OASIS |
|---|---|---|
| Jenis risiko | risiko struktural | risiko kelayakan |
| Pertanyaan yang dijawab | "apakah data satu pengguna bocor ke pengguna lain?" | "apakah ini bisa jalan dengan biaya dan waktu yang wajar?" |
| Kalau salah, ketahuannya | terlambat, saat audit atau saat bocor | segera, dari benchmark |
| Biaya memperbaiki belakangan | **sangat mahal** — setiap query, setiap endpoint, setiap test | sedang — adapter diganti, batas dipindahkan |
| Bisa dijawab tanpa aplikasi | tidak | **ya** |

Baris terakhir yang menentukan. Kelayakan OASIS dapat dibuktikan oleh **satu script Python berdiri sendiri**: tanpa API, tanpa database, tanpa pengguna. Script itu menjawab berapa token per run, berapa lama, seberapa sering skema gagal, dan berapa persona yang sanggup dibiayai. Semua tanpa menyentuh satu baris pun kode produksi.

RBAC tidak punya versi seperti itu. Tenancy bukan lapisan yang ditempel di atas — ia parameter setiap query. `analysis_runs`, `transactions`, `products`, `receipt_imports`, semuanya membawa `user_id` dan `business_id` sejak baris pertama migration. Membangun pipeline analisis dulu berarti membangun tabel tanpa pemilik, lalu memasang tenancy belakangan. Di situlah kebocoran lintas penyewa lahir, dan itu tepat yang dilarang `docs/07`.

### Keputusan

**RBAC dan identity adalah jalur produksi pertama. Spike OASIS berjalan paralel sejak hari pertama sebagai script buangan.**

Keduanya dimulai bersamaan; hanya satu yang menghasilkan kode yang disimpan.

Ini juga tetap menghormati `docs/09` yang menempatkan OASIS sebagai spike risiko pertama, bukan integrasi terakhir. Yang diubah bukan urutan penilaian risikonya, melainkan pemahaman bahwa spike bukan kode produksi.

### Konsekuensi negatif yang harus diterima

Kalau spike OASIS ternyata gagal — biaya terlalu besar, latency di atas toleransi, atau output tidak stabil — hasilnya baru diketahui setelah beberapa minggu kerja identity sudah berjalan. Kerja itu tidak terbuang, karena F-01 dan F-02 tetap Must apa pun nasib OASIS. Tetapi klaim inti produk berubah, dan perubahan itu perlu ADR.

Untuk membatasi kerugiannya, spike diberi **tenggat keras: selesai di akhir Fase 0.** Kalau belum ada jawaban pada saat itu, statusnya dilaporkan apa adanya sebagai risiko terbuka, bukan digeser diam-diam.

### Satu urutan lagi yang lebih penting daripada perdebatan ini

Jalur analisis **deterministik dibangun sebelum OASIS diintegrasikan** (Fase 3 sebelum Fase 4).

`docs/04` sudah mewajibkan fallback: kalau OASIS gagal, report tetap memuat evidence, finance, dan score. Kalau fallback dibangun belakangan, ia hampir selalu jadi jalur yang tidak pernah diuji sungguhan. Kalau dibangun lebih dulu, ia justru jalur utama yang sudah terbukti, dan OASIS menjadi tambahan yang kegagalannya memang tidak fatal — persis seperti yang dijanjikan dokumen arsitektur.

---

## Fase pembangunan

Tujuh fase. Setiap fase punya exit criteria yang berupa artifact atau test yang lulus, bukan persentase.

### Fase 0 — Fondasi dan spike

**Jalur A, produksi.** Kerangka backend: FastAPI, Python 3.11, Pydantic v2, PostgreSQL, Alembic, Redis, konfigurasi lewat environment, `docker compose` untuk pengembangan lokal. Bentuk error yang stabil sesuai `docs/06` beserta `correlation_id`. Middleware correlation ID dari request sampai log. Health check. Pipeline CI: lint, typecheck, test.

Frontend: perbaiki script `lint` yang masih memakai `next lint` (tidak tersedia di Next.js 16), definisikan script `test`, pasang Vitest dan Playwright. Copot `lenis` yang tidak terpakai.

**Jalur B, spike buangan.** Satu script menjalankan keempat council dengan cohort kecil melalui `camel-oasis` 0.2.5 dan Gemini. Diukur: token per run, wall-clock per stage, tingkat kegagalan schema validation, dan variance antar-run berulang.

**Exit criteria.**
- `docker compose up` menghasilkan API, PostgreSQL, dan Redis yang saling terhubung; endpoint health mengembalikan 200.
- CI hijau pada kedua repository.
- Script spike menghasilkan trace, structured ballot, hasil finance deterministik, dan draft report dari empat agent type.
- Angka benchmark ditulis ke `docs/14` beserta tanggal pengukuran. Ukuran cohort, jumlah round, dan model routing dikunci dari angka itu, bukan dari tebakan.
- Branch `dev` ada di kedua repository dan GitHub Actions hanya men-deploy dari `demo`.

### Fase 1 — Identity, tenancy, RBAC

Fase paling menentukan untuk keamanan. Tidak ada fitur lain yang dimulai sebelum ini lulus.

**Backend.**

- Tabel `users`, `auth_sessions`, `business_profiles`, `memberships`.
- `business_profiles` berelasi satu-ke-banyak terhadap `users` sesuai keputusan 9 Agustus 2026.
- `memberships` menyimpan `(user_id, business_id, role)` dengan `role` bernilai `owner` atau `cashier`. Peran melekat pada pasangan pengguna-usaha, bukan pada pengguna. Satu orang bisa jadi pemilik di usahanya sendiri dan kasir di usaha temannya.
- Password di-hash Argon2id. Access token berumur pendek, refresh token dirotasi dan dapat dicabut. Cookie `HttpOnly`, `Secure`, `SameSite`.
- Rate limit pada login dan register.
- Endpoint: `POST /v1/auth/register`, `/login`, `/logout`, `/refresh`, `GET /v1/me`, `GET/POST/PUT /v1/businesses`.
- Undangan kasir lewat kode, sesuai keputusan di bawah: `POST /v1/businesses/{id}/invites`, `POST /v1/invites/redeem`, `GET/DELETE /v1/businesses/{id}/invites/{code_id}`, dan `DELETE /v1/businesses/{id}/members/{user_id}`.
- Audit event untuk login berhasil, login gagal, pencabutan token, pembuatan dan penukaran kode undangan, serta pencabutan akses kasir.

**Penegakan RBAC.** Ini bagian yang paling mudah dikerjakan setengah-setengah, jadi bentuknya ditetapkan di sini.

Setiap fungsi repository menerima `ActorContext` berisi `user_id`, `business_id`, dan `role`. Tidak ada fungsi repository yang bisa dipanggil tanpanya. Query tanpa scope tidak ditulis, bukan ditulis lalu difilter.

Field yang terlarang bagi kasir — `hpp_idr`, marjin, modal awal, seluruh isi laporan analisis — **tidak diambil dari database** ketika `role` adalah `cashier`. Bukan diambil lalu disembunyikan di serializer, karena serializer bisa lupa dan pernah lupa di banyak proyek.

Resource milik penyewa lain mengembalikan **404, bukan 403**. 403 memberi tahu bahwa resource itu ada.

**Frontend.**

- `/masuk` dan `/daftar` yang benar-benar tersambung.
- App shell: sidebar tetap, area kerja, bilah bawah pada layar sempit.
- Sidebar dirender dari peran. Untuk kasir hanya *Beranda* dan *Catat Transaksi*; kelompok *Analisis*, *Belajar*, dan destination pengelolaan usaha tidak dirender sama sekali.
- Penanganan state `unauthorized` di seluruh layar tanpa membuang draft yang sedang diisi.

**Exit criteria.**
- Suite test lintas penyewa lulus: token pemilik A tidak dapat membaca apa pun milik pemilik B, dan responsnya 404.
- Suite test lintas peran lulus: token kasir mendapat 404 pada endpoint laporan dan analitik, dan respons produk yang diterimanya tidak memuat `hpp_idr` sama sekali — diperiksa pada payload JSON mentah, bukan pada tampilan.
- Sidebar kasir diverifikasi lewat E2E, bukan hanya unit test komponen.

### Fase 2 — Usaha, produk, transaksi, dan dashboard

**Backend.**

- `products` dengan `selling_price_idr` dan `hpp_idr` sebagai `bigint`. Tidak ada `float` di jalur uang, di kolom maupun di Pydantic model.
- `transactions` dan `transaction_items`, total dihitung backend dari item.
- Unique constraint `(business_id, client_reference)` ketika reference tidak null, untuk mencegah duplikat saat jaringan buruk.
- `GET /v1/dashboard` mengembalikan field `keadaan` sesuai `docs/15`. Penentuan keadaan dihitung backend dan punya unit test untuk keempat cabang.
- `GET /v1/transaction-analytics`: penjualan per hari, kuantitas dan pendapatan per produk, produk teratas dan terbawah dengan minimum exposure, sebaran per jam, dan hari tercatat. Seluruhnya query deterministik.
- Gerbang tujuh hari ditegakkan backend. Sebelum ambang tercapai, endpoint analitik mengembalikan bentuk yang menyatakan hari tercatat dan ambang, bukan array kosong yang membuat frontend menebak.
- Insight berbasis rule sesuai F-12, selalu menyebut observation window.

**Frontend.** Urutan mengikuti `docs/15`:

1. Blok utama **keadaan C** — usaha jalan, data belum cukup. Didahulukan karena tanpa notifikasi, blok ini adalah satu-satunya alat produk untuk membawa pengguna sampai hari ketujuh.
2. Keadaan A dan D.
3. Keadaan B dan rencana 30 hari.
4. Blok pendukung: insight terbaru, edukasi, analisis tersimpan.

Lalu destination: `/transaksi`, `/transaksi/catat`, `/produk`, `/analitik`. Ketiganya menyediakan pemilih usaha lokal; sidebar tetap tanpa pemilih usaha global.

**Exit criteria.**
- Mencatat satu transaksi dari layar `/transaksi/catat` selesai dalam bawah sepuluh detik pada perangkat menengah, diukur, bukan diperkirakan. Janji itu tertulis di tombol pada rancangan keadaan C; kalau tidak terpenuhi, janjinya yang dicabut, bukan pengukurannya.
- Golden test analitik: dataset tetap menghasilkan angka yang sama persis di setiap run.
- Keempat keadaan dashboard dapat direproduksi dari seed database.
- `docs/06` sudah diperbarui dengan field `keadaan` dan scoping `business_id`, pada commit yang sama.

### Fase 3 — Edukasi, gerbang, dan analisis deterministik

**Backend.**

- `education_modules`, `education_progress` yang menunjuk versi konten, dan `GET /v1/education/prerequisites`.
- Gerbang F-09 ditegakkan di `POST /v1/analyses`, bukan hanya disembunyikan di UI.
- `analysis_runs` beserta state machine lengkap dari `docs/02`.
- Evidence snapshot builder. Setiap field membawa source, `observed_at`, `retrieved_at`, dan quality sesuai bentuk evidence record di `docs/05`.
- Finance engine deterministik dengan formula otoritatif `docs/05` dan golden test. Marjin kontribusi nol atau negatif menghasilkan BEP tidak terdefinisi beserta warning, bukan pembagian yang meledak.
- Scoring engine `lrs-v0.2-unvalidated` dengan bobot 20/25/15/40. Rule set versioned; report menyimpan versinya.
- Report composer jalur deterministik. Menghasilkan report valid **tanpa satu pun panggilan LLM**, dengan `synthetic_simulation.status` bernilai `unavailable` dan alasan yang jujur.
- Disclaimer F-16 wajib ada di schema, bukan ditambahkan di frontend.

**Frontend.**

- `/edukasi` dan `/edukasi/{id}` beserta knowledge check.
- `/analisis` form input, `/analisis/riwayat`, `/laporan`, `/laporan/{id}`.
- Laporan menampilkan Evidence Confidence dan bagian Bukti & Keterbatasan dalam keadaan tidak collapsed.
- Setiap angka menampilkan provenance. Skor selalu tampil bersama `rule_version`.

**Exit criteria.**
- Satu analisis selesai dari ujung ke ujung dengan penyedia LLM dimatikan sepenuhnya, dan menghasilkan skor, BEP, evidence, serta disclaimer.
- Golden finance test lulus untuk kasus normal, marjin nol, marjin negatif, dan profit operasional negatif.
- Membuat analisis tanpa menyelesaikan edukasi prasyarat ditolak di lapisan API.

### Fase 4 — Integrasi OASIS

Baru di sini LLM masuk jalur produksi.

**Backend.**

- Celery worker terpisah dari API, dengan Redis sebagai broker.
- `GET /v1/analyses/{id}/events` sebagai SSE. Persentase berasal dari weighted stage completion, bukan timer.
- Adapter OASIS: keempat council, trace database unik per run, tanpa penghapusan implisit file lama.
- Cohort builder 12–24 persona, seimbang ke empat archetype, dengan `cohort_manifest` tersimpan.
- Protokol deliberasi empat round sesuai `docs/04`, termasuk `INTERVIEW` manual pada round 0.
- Trace extractor menjadi typed artifact. Prose bebas tidak pernah menjadi input score.
- Validator schema, citation, dan aritmetika. Klaim tanpa artifact ID ditolak.
- Batas keras per run: jumlah persona, round, concurrency, token, dan wall-clock. Kill switch penyedia lewat feature flag.
- Guardrail prompt injection: nama usaha, deskripsi produk, dan teks evidence dibungkus sebagai untrusted data.
- Allowlist field pada payload penyedia. Nama pelanggan, nomor telepon, teks struk mentah, dan catatan bebas tidak pernah ikut.

**Frontend.**

- `/analisis/{id}` menampilkan tahap berjalan secara live. Perubahan tahap diumumkan lewat live region `polite`; kegagalan lewat `assertive`.
- Bagian simulasi pada laporan, dengan setiap kutipan persona berlabel "respons sintetis".
- State `partial` dirender apa adanya. Komponen yang gagal tetap muncul di daftar isi dengan penanda tidak tersedia.

**Exit criteria.**
- Satu test case representatif menyelesaikan full four-agent run.
- **Mematikan penyedia LLM di tengah run menghasilkan `partial`**, laporan tetap memuat bagian deterministik, dan bagian simulasi menyatakan alasannya. Ini yang membedakan sistem yang jujur dari sistem yang menyamarkan.
- Tidak ada data pengguna yang dilarang muncul di payload penyedia, diverifikasi lewat test yang membaca payload sebenarnya.
- Batas token dan wall-clock benar-benar memutus run, dibuktikan lewat failure injection.

### Fase 5 — Foto struk, export, dan sisanya

**Backend.**

- Pipeline receipt import lengkap sesuai `docs/02` dan `docs/06`: upload session bertanda tangan, validasi MIME lewat magic bytes, OCR worker, draft, koreksi, dan confirm yang idempotent dan atomik.
- OCR tidak pernah menulis transaksi final secara otomatis.
- Selisih antara jumlah item dan total struk memerlukan konfirmasi eksplisit.
- Export PDF asinkron untuk laporan analisis dan ringkasan transaksi, dengan signed URL berumur pendek.
- Retention job untuk trace OASIS, gambar struk, dan PDF.

**Frontend.**

- `/transaksi/struk` dengan layar review OCR yang dapat diselesaikan sepenuhnya lewat keyboard.
- Tombol unduh PDF pada laporan dan analitik.

**Should, hanya bila waktu tersisa.** F-14 perbandingan dua skenario, dan F-15 dashboard admin.

**Exit criteria.** E2E `unggah foto struk → OCR → review → commit → analitik` lulus.

### Fase 6 — Validasi dan pengerasan

Wawancara dan expert review untuk bobot scoring. Pilot kalibrasi manusia versus sintetis. Uji SUS dengan target di atas 70. Test keamanan, aksesibilitas, matriks browser, dan beban. Uji backup dan restore PostgreSQL. Pembekuan versi.

**Baru setelah fase ini aplikasi nyata boleh di-deploy.**

---

## Spesifikasi backend

### Struktur

```text
app/
  api/v1/            router, tidak berisi logika bisnis
  core/              config, security, correlation, error
  domain/            entity dan value object, tanpa dependensi framework
  services/          orkestrasi use case
  repositories/      seluruh akses database, wajib menerima ActorContext
  engines/
    finance/         kalkulator deterministik + golden test
    scoring/         rule set versioned
    insight/         rule transaksi
  agents/
    oasis/           adapter, council, cohort, extractor
    prompts/         template versioned
  workers/           task Celery
  schemas/           Pydantic, sumber OpenAPI
migrations/
tests/
```

Aturan yang ditegakkan lewat review:

- `api/` tidak boleh mengimpor `repositories/` langsung; harus lewat `services/`.
- `engines/` tidak boleh mengimpor apa pun dari `agents/`. Arah sebaliknya boleh. Inilah batas deterministik dalam bentuk kode.
- `domain/` tidak mengimpor FastAPI, SQLAlchemy, maupun Celery.

### Uang

Kolom uang bertipe `bigint` berisi rupiah utuh. Pydantic memakai `int`. Tidak ada `float`, tidak ada `Decimal` di batas API. `Decimal` hanya boleh muncul sementara di dalam kalkulator finance, dan dibulatkan eksplisit ke `int` sebelum keluar.

Satu test yang berjalan di CI memindai seluruh model Pydantic dan kolom SQLAlchemy: field yang namanya berakhiran `_idr` dan bertipe `float` menggagalkan build.

### Bentuk error

Persis seperti `docs/06`. Tidak ada stack trace, tidak ada prompt, tidak ada respons penyedia mentah yang keluar ke client. `correlation_id` selalu ada dan dapat disalin pengguna dari UI.

---

## Spesifikasi frontend

### Rute aplikasi nyata

| Rute | Isi | Peran |
|---|---|---|
| `/` | Landing sinematik, sudah ada | publik |
| `/masuk`, `/daftar` | Autentikasi | publik |
| `/beranda` | Dashboard, empat keadaan | pemilik dan kasir |
| `/analisis` | Form analisis baru | pemilik |
| `/analisis/riwayat` | Daftar analisis tersimpan | pemilik |
| `/analisis/{id}` | Status run, tahap live | pemilik |
| `/laporan`, `/laporan/{id}` | Daftar dan detail laporan | pemilik |
| `/transaksi` | Riwayat transaksi per usaha | pemilik dan kasir |
| `/transaksi/catat` | Pencatatan manual | pemilik dan kasir |
| `/transaksi/struk` | Unggah dan review struk | pemilik dan kasir |
| `/analitik` | Analitik komposit dan per usaha | pemilik |
| `/produk` | Katalog, HPP, dan marjin | pemilik |
| `/edukasi`, `/edukasi/{id}` | Modul edukasi | pemilik |
| `/pengaturan` | Profil usaha dan akses kasir | pemilik |

Untuk kasir, rute di luar haknya tidak sekadar disembunyikan dari sidebar — mengaksesnya langsung lewat URL menghasilkan halaman tidak ditemukan, dan API di belakangnya mengembalikan 404.

### Struktur

Ikuti `AGENTS.md` frontend. `features/` berisi `auth`, `dashboard`, `education`, `analysis`, `transactions`, `products`. Tipe DTO hanya dari `lib/contracts`, ditranskripsi dari OpenAPI. Tidak ada bentuk DTO yang didefinisikan ulang di dalam komponen.

### Lima state per layar

Setiap layar yang mengambil data wajib menangani loading, empty, error, unauthorized, dan partial. Ini bagian dari definition of done. Layar yang hanya menangani jalur bahagia tidak dianggap selesai, sekalipun terlihat benar saat dicoba.

### Yang tidak boleh dihapus

Disclaimer DSS di layar dan di PDF. Bagian Evidence Confidence dan Bukti & Keterbatasan, tidak collapsed. Label "respons sintetis" pada setiap kutipan agent. `rule_version` di mana pun skor tampil.

---

## Dokumen yang harus diperbarui saat pembangunan

| Kapan | Dokumen | Perubahan |
|---|---|---|
| Fase 0 | `docs/14` | Angka benchmark spike beserta tanggal pengukuran |
| Fase 1 | `docs/06`, `docs/10` | Endpoint `memberships`, mekanisme undangan kasir, tabel `memberships` pada ERD |
| Fase 2 | `docs/06` | Field `keadaan` pada `GET /v1/dashboard` dan scoping `business_id` |
| Fase 4 | `docs/04` | Ukuran cohort dan jumlah round final, menggantikan rentang 12–24 |
| Fase 6 | `docs/05` | Status kalibrasi bobot LRS, termasuk bila hasilnya negatif |

Utang `docs/06` untuk field `keadaan` sudah tercatat di `HANDOVER.md` sejak 9 Agustus 2026 dan belum dibayar. Jangan menyentuh endpoint dashboard sebelum itu beres.

---

## Cara mengundang kasir

Ditetapkan product owner 13 Agustus 2026: **kode undangan, dalam bentuk paling sederhana yang masih aman.**

Alur lengkapnya:

1. Pemilik membuka `/pengaturan`, memilih usaha, lalu menekan *Undang kasir*. Sistem menghasilkan kode acak delapan karakter.
2. Pemilik menyampaikan kode itu ke kasir lewat cara apa pun yang sudah mereka pakai sehari-hari. Sistem tidak mengirimkannya.
3. Kasir mendaftar akun sendiri seperti pengguna biasa, lalu memasukkan kode.
4. Penukaran kode membuat satu baris `memberships` dengan `role` bernilai `cashier` dan `business_id` dari kode tersebut.

Aturan kode:

| Hal | Ketentuan |
|---|---|
| Panjang | delapan karakter, dari alfabet yang membuang karakter mudah tertukar seperti `0`, `O`, `1`, dan `I` |
| Masa berlaku | tujuh hari |
| Pemakaian | sekali pakai |
| Pencabutan | pemilik dapat menghapus kode yang belum terpakai, dan mencabut akses kasir yang sudah bergabung |
| Penyimpanan | kode disimpan sebagai hash, bukan teks terang, dan hanya ditampilkan sekali saat dibuat |

Kenapa ini yang paling sederhana yang masih aman. Ia tidak butuh pengiriman email, padahal notifikasi sudah dikeluarkan dari MVP dan menambahkannya berarti membangun infrastruktur untuk satu alur saja. Kasir memegang kredensialnya sendiri, sehingga tindakannya benar-benar dapat diatribusikan di audit trail. Alternatif "akun dibuatkan pemilik" terlihat lebih sederhana, tetapi membuat pemilik mengetahui password kasir dan merusak atribusi audit, jadi ia lebih murah di awal dan lebih mahal kemudian.

Yang **tidak** dibangun di MVP: undangan lewat email, tautan undangan yang dapat diklik, kode yang dapat dipakai berkali-kali, dan peran selain `owner` dan `cashier`.

---

## Keputusan yang menunggu product owner

### 1. Batas jumlah usaha per akun

Tanpa batas, satu akun dapat membuat ratusan usaha. Karena subscription dikeluarkan dari MVP, batas ini tidak lagi bisa dikaitkan dengan model freemium — ia harus berupa angka tetap. Usulan: lima usaha per akun, dengan pesan yang menjelaskan batasnya. Belum diputuskan.

### 2. Sumber data kompetitor untuk produksi

Demo memakai fixture. `docs/05` menyatakan Google Places memerlukan review terms lebih dulu, dan Overpass publik adalah shared service yang tidak layak dijadikan sandaran produksi. Keputusan ini memblokir Fase 3, karena evidence snapshot builder tidak dapat dibangun tanpa sumber yang jelas.

---

## Risiko

| Risiko | Dampak | Penanganan |
|---|---|---|
| Spike OASIS menunjukkan biaya atau latency di luar toleransi | Klaim inti produk berubah | Tenggat keras di akhir Fase 0; jalur deterministik dibangun lebih dulu sehingga produk tetap utuh tanpa OASIS |
| Sumber data kompetitor tidak tersedia dengan lisensi jelas | F-04 tidak dapat dipenuhi dengan jujur | Turunkan Evidence Confidence dan nyatakan keterbatasannya di laporan. Jangan menambal dengan angka buatan LLM |
| RBAC ditegakkan hanya di UI | Kebocoran data lintas peran | Test lintas penyewa dan lintas peran menjadi exit criteria Fase 1, memeriksa payload JSON mentah |
| Bobot LRS tidak pernah tervalidasi | Skor tampak otoritatif padahal hipotesis | Label `unvalidated` tetap tampil di UI dan di PDF. Jangan dihapus demi tampilan bersih |
| Pembangunan aplikasi nyata merusak demo | Kehilangan satu-satunya artifact yang dapat ditunjukkan | Branch `demo` terpisah dari `dev`; larangan impor dari `src/demo/`; E2E demo tetap berjalan di CI |
| Deployment aplikasi setengah jadi | Melanggar keputusan product owner | Trigger deploy hanya dari `demo`; `main` tidak dipakai |
| Kode undangan bocor ke orang yang salah | Akses kasir ke usaha yang bukan haknya | Sekali pakai, berlaku tujuh hari, disimpan sebagai hash, dan dapat dicabut pemilik. Hak kasir sendiri sudah dibatasi pada pencatatan transaksi |
