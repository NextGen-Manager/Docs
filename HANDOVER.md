# Handover

Catatan keadaan proyek untuk serah terima antarsesi. Diperbarui setiap sesi berakhir.

**Terakhir diperbarui:** 16 Agustus 2026

---

## Cara memakai dokumen ini

Baca bagian **Keadaan sekarang** dan **Keputusan yang menunggu** lebih dulu. Sisanya konteks.

Di akhir sesi, perbarui: tanggal di atas, tabel Keadaan sekarang, dan bagian Sudah selesai. Keputusan yang baru dijawab pemilik dipindahkan dari *menunggu* ke *sudah diambil* beserta konsekuensinya. Kalau muncul pertanyaan baru yang menyangkut scope, prioritas, atau data pengguna, tambahkan ke *menunggu* — jangan diputuskan sendiri.

---

## Keadaan sekarang

| Repository | Branch kerja | Commit | Belum di-commit |
|---|---|---|---|
| `Docs` | `main` | `3ec6787` | pembaruan handover merge Fase 4 belum di-commit |
| `SimuMarketAI` (frontend) | `feat/phase5-receipt-export` | `b5cb12d` | bersih; branch baru dari `dev` setelah merge Fase 4 |
| `SimuMarketAI-BE` | `feat/phase5-receipt-export` | `a004466` | bersih; branch baru dari `dev` setelah merge Fase 4 |

### Peran branch, ditetapkan 13 Agustus 2026

| Branch | Peran |
|---|---|
| `dev` | seluruh pembangunan aplikasi nyata, di kedua repository kode |
| `demo` | demo yang dibekukan, satu-satunya sumber deploy production |
| `main` | tidak dipakai selama masa pembangunan |

`dev` sudah ada dan di-push di kedua repository. Frontend `dev` berangkat dari `origin/main` (`c288af5`, hasil merge PR #5), lalu memuat halaman `/demo/langganan` dan kebijakan deploy khusus demo. `feat/dashboard` sudah tidak dipakai lagi.

**Live:** https://simumarket-ai.vercel.app — GitHub Actions men-deploy production **hanya dari push ke `demo`**. Trigger `main` dan trigger manual sudah dicabut. `origin/demo` telah disegarkan ke `f717571` pada 13 Agustus 2026 dan memicu deployment demo terbaru.

### Kalau push ke repo frontend gagal dengan `Internal Server Error`

Bukan ruleset dan bukan izin. Server GitHub gagal me-resolve delta pada thin pack. Ulangi dengan `git push --no-thin`. Sudah terbukti pada 13 Agustus 2026.

---

## Sudah selesai

### Dokumentasi (`Docs`)

- `01`–`11` sudah ada sejak awal proyek.
- `12` workflow aplikasi, `13` UI system dan rencana mock, `14` keputusan tech stack — dibuat di sesi ini.
- `15` dashboard dan app shell memuat rancangan sidebar, empat keadaan blok utama, destination operasional, dan tabel hak akses per peran.
- `16` PRD pembangunan MVP: batas scope, pembekuan demo, peran branch, tujuh fase beserta exit criteria, spesifikasi backend dan frontend, dan daftar risiko.
- `HANDOVER.md` (dokumen ini) menjadi catatan keadaan lintas sesi.
- `ADR-002` menaikkan frontend ke Next.js 16 karena 14 sudah end of life. Status Accepted.
- `AGENTS.md` + `CLAUDE.md` di ketiga repository. Masing-masing berdiri sendiri: lima aturan inti ditulis ulang di tiap repo supaya clone tunggal tetap membawanya.

### Frontend (`SimuMarketAI`, branch `dev`)

Next.js 16 + React 19 + Tailwind v4. `tsc --noEmit` bersih, build lolos, seluruh rute 200.

Fondasi Fase 0 sudah menambahkan ESLint flat config, Vitest, Playwright, script pemeriksaan, dan workflow CI. Dependency `lenis` yang tidak terpakai sudah dicopot.

**Aplikasi sebenarnya:**
- `/` landing sinematik; `/masuk` dan `/daftar` tersambung ke session backend melalui same-origin proxy. Token tetap berada di cookie `HttpOnly`.
- App shell membedakan onboarding, pemilik, dan kasir. Sidebar kasir hanya memuat *Beranda* dan *Catat transaksi*.
- `/beranda` memakai field `keadaan` dari backend dan menampilkan dashboard komposit pemilik atau ringkasan toko kasir.
- `/produk`, `/transaksi`, `/transaksi/catat`, `/analitik`, dan `/pengaturan` memakai data API nyata dengan pemilih usaha lokal. Frontend hanya memformat uang dan tidak menghitung agregat.
- `/edukasi`, `/edukasi/{id}`, `/analisis`, `/analisis/riwayat`, `/laporan`, dan `/laporan/{id}` sudah menjadi rute aplikasi nyata. DTO berada di `src/lib/contracts`; report menampilkan rule version, confidence, evidence, missing evidence, warning, limitation, status simulasi, dan disclaimer.
- Frontend tidak menghitung ulang score atau finance. Contract test sengaja mengirim nilai pendapatan yang berbeda satu rupiah dari hasil hitung input dan memastikan UI tetap menampilkan nilai server.
- `/analisis/{id}` mengikuti event worker melalui SSE, melanjutkan stream memakai `Last-Event-ID`, lalu berpindah ke polling snapshot otoritatif bila koneksi berulang kali gagal. Penyebab kegagalan memakai `failure_code` dari server, bukan ditebak dari warning.
- Bagian simulasi menampilkan cohort, round, objection, acceptable price band, kutipan berlabel *respons sintetis*, manifest agent, dan keterbatasan tanpa menghitung ulang angka server.
- Verifikasi Phase 3 pada 15 Agustus 2026: lint dan typecheck bersih, 31 unit/component test serta empat E2E Chromium lulus, production build berhasil, dan `npm audit --omit=dev` melaporkan nol vulnerability. Setelah review kontrak, focused report test sebanyak 10 kasus juga lulus.

**Demo (`/demo/*`), seluruhnya data contoh:**
- Journey A: `/demo/analisis/input` (peta, produk, modal) → `/demo/edukasi` (gerbang F-09) → `/demo/analisis/konfirmasi` → `/demo/analisis/proses` (empat agent) → `/demo/laporan/{id}` → `/demo/diskusi`.
- Workspace: dashboard, analitik komposit dan per usaha, katalog produk per usaha, riwayat analisis, serta riwayat laporan memakai app shell tetap dan tidak menjalankan autoplay.
- Journey B: `/demo/transaksi/produk` → `/demo/transaksi/catat` (*Transaction Management*) dengan cabang input manual atau `/demo/transaksi/struk` → gate tujuh hari → `/demo/transaksi/analitik` (ranking produk, tren mingguan, sebaran per jam, rekomendasi, dan ekspor).
- Demo terisolasi di `src/app/demo/` dan `src/demo/`. Menghapus keduanya tidak merusak aplikasi.

### Backend (`SimuMarketAI-BE`)

Fondasi Fase 0 tersedia di branch `dev`: FastAPI, konfigurasi environment, bentuk error stabil, correlation ID, PostgreSQL 16 dengan pgvector, Alembic, Redis, Docker Compose, health/readiness endpoint, dan workflow CI.

Fase 1–2 sudah di-commit dan di-push ke `dev`: Argon2, access/refresh cookie dengan rotation dan revocation, rate limit auth, business membership per tenant, kode kasir delapan karakter sekali pakai, audit event, serta penegakan 404 lintas penyewa/peran. Operasional mencakup produk, transaksi atomik dan idempotent per `(business_id, client_reference)`, dashboard backend-owned, gate tujuh hari, golden transaction analytics, dan insight rule-versioned. Router hanya memanggil service; repository menerima scope tenant.

Fondasi deterministik Fase 3 sudah di-commit dan di-push ke `dev`:

- contract `EvidenceRecord`, `MissingEvidence`, dan `EvidenceProvider`; runtime tanpa sumber nyata mengembalikan missing evidence, sedangkan fixture hanya tersedia di test dan ditolak pada staging/production;
- finance engine sesuai formula `docs/05`, memakai integer rupiah dan `Decimal` untuk rasio, dengan hasil `null` dan warning ketika BEP atau payback tidak terdefinisi;
- scoring `lrs-v0.2-unvalidated` dengan bobot 20/25/15/40, tanpa default score dan tanpa reweight saat dimensi tidak dapat dinilai;
- report composer dan validator deterministik yang terpisah dari `integrations/`, memeriksa aritmetika dan provenance angka pasar;
- education module/version/progress/knowledge check serta gate F-09; tidak adanya konten terbit menghasilkan `EDUCATION_CONTENT_UNAVAILABLE`, bukan kelulusan kosong;
- analysis input snapshot, evidence item, report record, correlation ID, idempotency, state progression, structured warning, failure code, endpoint report/history, dan endpoint SSE satu-event yang valid sebagai contract awal Phase 4;
- retry dengan `Idempotency-Key` yang sama mengembalikan run lama hanya untuk payload yang sama; payload berbeda ditolak `409` dan race tidak mengeksekusi run yang sama dua kali.

Verifikasi lokal 15 Agustus 2026: Ruff, format check, mypy, dan 110 test backend lulus. Migrasi Alembic `0001` sampai `0006`, downgrade `0005` lalu upgrade kembali, dan `alembic check` sudah lulus pada PostgreSQL 16 kosong saat handoff Phase 3.

Spike OASIS ditempatkan terisolasi di `spikes/oasis` dengan environment dan lockfile sendiri karena `camel-oasis==0.2.5` mengunci `pytest-asyncio==0.23.6`, sedangkan dependency transitif `mcp` perlu dibatasi `<2` agar `camel-ai==0.2.78` dapat diimpor. Spike sudah memiliki empat profil agent, schema artifact dan ballot, trace unik, hard limit, metrik token dan durasi, serta finance integer-rupiah deterministik. Dependency probe dan lima test spike lulus. Run Gemini live dan benchmark berulang belum dijalankan karena `GEMINI_API_KEY` belum tersedia; Fase 0 belum memenuhi exit criteria sampai hasil nyata dicatat di `docs/14`.

Implementasi dan hardening Fase 4 sudah di-commit per fungsi, dipush, lalu digabung ke `dev` pada frontend dan backend tanggal 16 Agustus 2026:

- `POST /v1/analyses` hanya menyimpan run `queued`, lalu Celery worker menjalankan state machine penuh. API, worker, dan Celery beat dipisah di Docker Compose.
- Empat council berjalan melalui orchestrator yang sama untuk adapter fake dan live. Market melakukan deliberasi evidence, persona menjalankan baseline, exposure, interaction, intervention, dan final ballot, Finance memanggil calculator deterministik lebih dulu, lalu Report hanya menerima artifact upstream yang lolos validasi.
- Payload provider memakai allowlist `SimulationRequest`, identifier di-hash, contact detail dan URL di-redact, dan user text dibungkus sebagai untrusted data. Social action dan interview ikut dihitung dalam token serta wall-clock budget.
- PostgreSQL menyimpan event, agent run, instance, artifact, trace metadata, model/prompt manifest, lease, dan attempt count melalui migrasi `0007` dan `0008`. Recovery memakai conditional transition dan fencing agar worker lama tidak dapat menimpa run baru atau menghapus report yang baru selesai.
- Kegagalan OASIS menghasilkan report `partial` dengan bagian deterministik tetap tersedia. Schema, citation, numeric provenance, dan arithmetic validator menolak artifact yang menciptakan evidence atau angka baru.
- Adapter live sudah type-checked dan binding `camel-oasis` 0.2.5 sudah diperiksa terhadap API package. Dua test live sengaja `skip` selama `GEMINI_API_KEY` kosong; hasil schema, latency, token, dan stabilitas provider nyata belum boleh diklaim.
- Behavioral profile persona sekarang berbeda untuk empat archetype tanpa mengarang demografi. Profile dan prompt dinaikkan ke versi `v2`.
- Social action yang dipanggil langsung untuk menjaga observability sekarang memakai semaphore adapter, sehingga concurrency limit tidak dilewati. Setiap round menyimpan persona yang benar-benar melihat marker stimulus; reaksi hanya dihitung dari exposure tersebut.
- ADR-004 menetapkan deterministic calculator dan validator sebagai milik application orchestrator. Empat role tetap OASIS `SocialAgent`, tetapi autonomous LLM tool call tidak menjadi prasyarat keluarnya angka otoritatif.
- `camel-oasis` 0.2.5 membuat `./log` pada saat import. Image worker sekarang menyiapkan `/app/log` writable khusus untuk user non-root tanpa membuka write access ke seluruh `/app`.
- Import probe image worker menemukan `mcp==2.0.0` tidak kompatibel dengan CAMEL 0.2.78. Extra OASIS sekarang memin `mcp<2` dan lockfile menghasilkan 1.29.0. Image final berhasil mengimpor OASIS/CAMEL, memuat adapter live, serta mendaftarkan task `analysis.run` dan `analysis.recover`.
- Worker dan Celery beat berhasil hidup sebagai user non-root `simumarket`, terhubung ke Redis, dan menjawab `celery inspect ping`. Beat menyimpan scheduler di `/tmp`, sedangkan trace memakai volume khusus.
- Task Celery sinkron membuat event loop baru melalui `asyncio.run`; engine PostgreSQL dan client Redis sekarang selalu ditutup setelah setiap task agar koneksi dari loop lama tidak digunakan ulang.
- Verifikasi final 15 Agustus 2026: backend Ruff, format check, dan mypy bersih; 207 test lulus dan dua test Gemini live skip secara eksplisit. Migrasi PostgreSQL kosong lulus `0001` sampai `0008`, `alembic check`, downgrade `0008` ke `0007`, lalu upgrade ulang. Frontend lint/typecheck bersih, 57 test dan tujuh E2E Chromium lulus, production build berhasil, serta audit production dependency melaporkan nol vulnerability.
- Verifikasi hardening 16 Agustus 2026: Ruff, format check, dan mypy bersih; 213 test lulus dan dua test Gemini live tetap skip. Image worker dibangun ulang, OASIS berhasil di-import dari `/app` sebagai UID 10001, `/app/log` terverifikasi writable, adapter live dapat di-import, dan Celery worker menjawab `pong`. Tiga recovery task berurutan pada worker process yang sama juga lulus tanpa error lintas event loop.
- Database dev lokal sempat memiliki schema `0008` dengan revision marker `0007` akibat file migrasi lama yang pernah diedit. Tipe kolom, nullability, default, dan indeks diperiksa satu per satu sebelum marker di-stamp ke `0008`; `alembic check` kemudian lulus tanpa perubahan schema atau data.

---

## Keputusan yang sudah diambil

Ditetapkan product owner **9 Agustus 2026**. Rinciannya di `docs/15`.

### 1. Satu akun boleh punya banyak usaha

Dashboard menampilkan komposit seluruh usaha dan sidebar tidak memiliki pemilih usaha global. Scope usaha dipilih di dalam halaman transaksi, produk, dan analitik masing-masing.

Modul analisis **tidak** terikat usaha — analisis justru dijalankan sebelum usaha ada. Satu analisis dapat dinaikkan menjadi usaha; sisanya tetap tersimpan sebagai skenario pembanding.

Berdampak pada skema: `business_profile` menjadi satu-ke-banyak terhadap user, dan seluruh query transaksi di-scope `business_id`, bukan hanya `user_id`.

### 2. Tidak ada notifikasi untuk sementara

Tidak ada email maupun notifikasi browser di MVP.

**Konsekuensi yang perlu dipegang:** gerbang tujuh hari kehilangan satu-satunya pendorong dari luar. Keadaan C pada dashboard jadi **satu-satunya alat** produk untuk membawa pengguna sampai hari ketujuh — karena itu ia tetap dikerjakan lebih dulu.

### 3. Dua peran: pemilik dan kasir

Kasir ada karena ia yang merekam transaksi. Aksesnya dibatasi pada pekerjaan itu: mencatat transaksi, melihat daftar produk beserta harga jual, dan melihat ringkasan hari ini.

Kasir **tidak** melihat HPP dan marjin, analitik mingguan, skor kelayakan, proyeksi finansial, modal awal, Market Analysis, maupun modul edukasi.

Pada demo, profil Raka Pratama dapat diganti antara mode pemilik dan kasir per toko. Sidebar kasir hanya merender *Dashboard* dan *Catat Transaksi*. Daftar produk beserta harga jual hanya tersedia sebagai pilihan saat mencatat; kasir tidak mendapat destination pengelolaan produk.

Dua alasannya: HPP dan marjin adalah data biaya, bukan data operasional — kasir butuh harga jual untuk mencatat, tidak butuh tahu untungnya. Dan skor serta proyeksi finansial menyangkut keputusan modal pemilik; membocorkannya ke seluruh karyawan mengubah sifat produk tanpa pemilik pernah memilih itu.

Tabel hak akses lengkap di `docs/15` telah dikonfirmasi product owner pada 9 Agustus 2026.

### 4. Kasir diundang lewat kode

Ditetapkan **13 Agustus 2026**. Pemilik menghasilkan kode delapan karakter, sekali pakai, berlaku tujuh hari, disimpan sebagai hash dan hanya ditampilkan sekali. Kasir mendaftar akun sendiri lalu menukarkan kode; penukaran membuat baris `memberships` dengan `role` `cashier` untuk satu `business_id`.

Tidak dibangun: undangan lewat email, tautan undangan, kode multi-pakai, dan peran selain `owner` dan `cashier`. Rinciannya di `docs/16`.

### 5. Subscription dikeluarkan dari MVP

Ditetapkan **13 Agustus 2026**. Tidak ada plan, kuota berbayar, maupun integrasi pembayaran di aplikasi nyata. Halaman `/demo/langganan` tetap ada sebagai permukaan demo, bukan fitur.

Konsekuensi: batas jumlah usaha per akun tidak lagi dapat dikaitkan dengan model freemium proposal §5.10 dan harus berupa angka tetap.

### 6. Urutan pembangunan: RBAC lebih dulu, spike OASIS paralel

Ditetapkan **13 Agustus 2026**. Alasan lengkap di `docs/16`. Ringkasnya: kelayakan OASIS dapat dibuktikan satu script berdiri sendiri tanpa API dan tanpa database, sedangkan tenancy adalah parameter setiap query sehingga tidak dapat ditempel belakangan.

Urutan yang lebih penting daripada itu: **jalur analisis deterministik dibangun sebelum OASIS diintegrasikan**, supaya fallback yang diwajibkan `docs/04` menjadi jalur yang benar-benar teruji.

---

## Keputusan yang menunggu product owner

Yang **tidak boleh diputuskan sendiri** oleh sesi berikutnya.

### 1. Batas jumlah usaha per akun

Tanpa batas, satu akun bisa membuat ratusan usaha dan menghabiskan kuota analisis. Karena subscription dikeluarkan dari MVP, batas ini harus berupa angka tetap. Usulan: lima.

**Status:** belum diputuskan.

### 2. Sumber data kompetitor untuk produksi

Demo memakai fixture. `docs/05` menyatakan Google Places butuh review terms lebih dulu, dan Overpass publik adalah shared service yang tidak layak jadi sandaran produksi.

**Terdampak.** Contract dan fallback evidence sudah tersedia, tetapi run produksi tetap `partial` sampai adapter sumber nyata dipilih dan direview lisensinya.

**Status:** belum diputuskan.

### 3. Threshold rule scoring dan bobot Evidence Confidence

Bobot dimensi LRS 20%/25%/15%/40% sudah ditetapkan, tetapi batas rule `MS-*`, `DP-*`, `PP-*`, dan `OR-*` belum berasal dari expert review. Implementasi menyebutnya `lrs-v0.2-unvalidated`. Bobot internal formula `evidence-confidence-v0.1-unvalidated` juga masih hipotesis.

Keduanya boleh dipakai untuk integrasi teknis dan calibration run, tetapi tidak boleh dipresentasikan sebagai model yang sudah sahih. Perubahan threshold atau bobot setelah review wajib membuat versi rule baru dan ADR sebelum implementasi.

**Status:** menunggu product owner dan expert review.

### 4. Normalisasi penyimpanan hasil finance dan score

`evidence_items` sudah relasional, sedangkan finance scenario dan score result saat ini tersimpan di payload versioned `analysis_reports`. ERD `docs/10` masih menargetkan tabel `FINANCE_SCENARIO` dan `SCORE_RESULT` tersendiri.

Ini tidak memblokir integrasi OASIS Phase 4, tetapi harus diselesaikan sebelum schema persistence dinyatakan memenuhi ERD penuh atau sebelum query lintas report membutuhkan hasil terstruktur.

**Status:** utang implementasi yang belum dijadwalkan.

---

## Catatan yang harus dibawa, jangan dilupakan

Hal-hal yang sudah diputuskan tetapi mudah terlewat dan berakibat.

### Penyempitan scope yang harus disebut apa adanya di laporan akhir

- **Jenis usaha dihapus dari alur** atas instruksi pemilik, karena produk memang khusus F&B. Akibatnya **F-03 tinggal separuh** (hanya lokasi), dan **F-08** menampilkan empat topik edukasi yang sama untuk semua pengguna alih-alih dikurasi per jenis usaha. Tercatat di `SimuMarketAI/DEMO-PLAN.md`. Jangan diklaim terpenuhi.
- **F-10A (foto struk)** tidak ada di tabel kebutuhan fungsional proposal — itu elaborasi di repo `Docs`. Di demo diperlakukan sebagai opsi input kedua, bukan requirement Must.
- **Bobot aktif Launch Readiness Score adalah `lrs-v0.2-unvalidated`:** 20% saturasi pasar, 25% potensi permintaan, 15% posisi harga, dan 40% kesiapan operasional. Rentang interpretasi tidak berubah; laporan `lrs-v0.1-unvalidated` tetap historis. Keputusan tercatat di `ADR-003`.

### Versi dan lisensi

- **Python dikunci di 3.11** oleh `camel-oasis` 0.2.5, bukan karena preferensi. Jangan "membantu" menaikkannya.
- **Gemini 2.5 keluar dari GA pada 16 Oktober 2026.** Model default dipilih `gemini-3.1-flash-lite`. Model berlabel `-preview` dilarang untuk jalur demo.
- **Peta pada demo memakai Leaflet dan tile OpenStreetMap.** Lokasi dan kompetitor tetap fixture demo; pemakaian penyedia data bisnis nyata masih menunggu review lisensi (lihat `docs/05`).
- **Video edukasi belum ditentukan.** Yang ada baru pemutar kosong.

### Demo dibekukan

**Kemampuan demo tidak boleh berubah dari keadaan 13 Agustus 2026. Ini batas keras dari product owner.** `src/app/demo/**` dan `src/demo/**` hanya boleh disentuh untuk tiga hal: bug yang membuat demo gagal jalan, perbaikan aksesibilitas, dan penyesuaian yang dipaksa kenaikan versi dependency. Tidak ada layar baru, langkah baru, atau data contoh baru. Aplikasi nyata tidak boleh mengimpor apa pun dari `src/demo/`.

### Utang teknis

- **`main` frontend berhenti di `c288af5`** dan tidak dipakai lagi selama masa pembangunan. Isinya sudah termuat seluruhnya di `dev`, jadi ia bukan cabang yang tertinggal melainkan cabang yang ditinggalkan. Jangan menjadikannya rujukan keadaan terkini.
- **Image worker OASIS sekitar 2,97 GB** karena dependency Torch/CUDA transitif. Ini tidak memblokir fungsi Fase 4, tetapi perlu CPU-only dependency audit sebelum deployment aplikasi nyata agar waktu pull dan penggunaan disk tidak berlebihan.

---

## Langkah berikutnya

Rencana lengkap ada di `docs/16`. Yang harus dibereskan lebih dulu, berurutan:

1. Mulai Fase 5 dari private object storage, lalu OCR review/confirm, export PDF async, dan retention job pada branch `feat/phase5-receipt-export` di kedua repository kode.
2. Saat Gemini API key tersedia, jalankan test live dan benchmark berulang. Catat token, latency, schema failure, dan variance sebenarnya ke `docs/14`; lalu bekukan ukuran cohort dan jumlah round di `docs/04`.
3. Pilih dan review lisensi sumber evidence pasar. Sampai keputusan ada, runtime production tetap memakai unavailable provider dan run tetap jujur berstatus `partial`.
4. Scenario comparison tetap Should dan hanya dikerjakan bila scope Must Fase 5 sudah lulus E2E.

---

## Yang perlu diketahui saat bekerja di repo ini

- Aturan lengkap ada di `AGENTS.md` tiap repository. Lima aturan inti: LLM tidak pernah jadi sumber angka otoritatif; setiap angka punya provenance; kegagalan parsial tidak disamarkan; uang selalu integer rupiah; data pengguna tidak bocor ke prompt.
- **Dokumen menang atas kode.** Kalau kode menyimpang dari `Docs`, yang salah kode — kecuali ada ADR.
- Teks yang dilihat pengguna Bahasa Indonesia; kode, nama file, dan commit message Bahasa Inggris.
- **Commit signing aktif** (GPG). Kalau `gpg: signing failed: Timeout` muncul, cache passphrase-nya habis — buka terminal interaktif, jalankan `echo test | gpg --clearsign`, lalu ulangi. Jangan pakai `--no-gpg-sign` tanpa izin pemilik.
- **Status pengembangan tidak boleh bocor ke UI.** Tidak ada teks semacam "fitur belum tersedia" di halaman pengguna. Badge `MODE DEMO` di dalam `/demo` adalah pengecualian yang disengaja karena menandai data contoh.
