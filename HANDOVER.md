# Handover

Catatan keadaan proyek untuk serah terima antarsesi. Diperbarui setiap sesi berakhir.

**Terakhir diperbarui:** 14 Agustus 2026

---

## Cara memakai dokumen ini

Baca bagian **Keadaan sekarang** dan **Keputusan yang menunggu** lebih dulu. Sisanya konteks.

Di akhir sesi, perbarui: tanggal di atas, tabel Keadaan sekarang, dan bagian Sudah selesai. Keputusan yang baru dijawab pemilik dipindahkan dari *menunggu* ke *sudah diambil* beserta konsekuensinya. Kalau muncul pertanyaan baru yang menyangkut scope, prioritas, atau data pengguna, tambahkan ke *menunggu* — jangan diputuskan sendiri.

---

## Keadaan sekarang

| Repository | Branch kerja | Commit | Belum di-commit |
|---|---|---|---|
| `Docs` | `main` | commit ini | bersih setelah handover ini |
| `SimuMarketAI` (frontend) | `dev` | `5aba8cd` | bersih dan sinkron dengan `origin/dev`; CI hijau |
| `SimuMarketAI-BE` | `dev` | `dfb63df` | bersih dan sinkron dengan `origin/dev`; CI hijau |

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
- Verifikasi lokal 14 Agustus 2026: lint, typecheck, 9 unit test, 2 E2E Chromium, dan production build lulus. E2E pencatatan transaksi lulus batas 10 detik dengan CPU throttling 4×.

**Demo (`/demo/*`), seluruhnya data contoh:**
- Journey A: `/demo/analisis/input` (peta, produk, modal) → `/demo/edukasi` (gerbang F-09) → `/demo/analisis/konfirmasi` → `/demo/analisis/proses` (empat agent) → `/demo/laporan/{id}` → `/demo/diskusi`.
- Workspace: dashboard, analitik komposit dan per usaha, katalog produk per usaha, riwayat analisis, serta riwayat laporan memakai app shell tetap dan tidak menjalankan autoplay.
- Journey B: `/demo/transaksi/produk` → `/demo/transaksi/catat` (*Transaction Management*) dengan cabang input manual atau `/demo/transaksi/struk` → gate tujuh hari → `/demo/transaksi/analitik` (ranking produk, tren mingguan, sebaran per jam, rekomendasi, dan ekspor).
- Demo terisolasi di `src/app/demo/` dan `src/demo/`. Menghapus keduanya tidak merusak aplikasi.

### Backend (`SimuMarketAI-BE`)

Fondasi Fase 0 tersedia di branch `dev`: FastAPI, konfigurasi environment, bentuk error stabil, correlation ID, PostgreSQL 16 dengan pgvector, Alembic, Redis, Docker Compose, health/readiness endpoint, dan workflow CI. Verifikasi lokal 13 Agustus 2026: Ruff, format check, mypy, 16 test, migrasi Alembic, serta health/readiness API melalui container lulus.

Fase 1–2 tersedia di working tree: Argon2, access/refresh cookie dengan rotation dan revocation, rate limit auth, business membership per tenant, kode kasir delapan karakter sekali pakai, audit event, serta penegakan 404 lintas penyewa/peran. Operasional mencakup produk, transaksi atomik dan idempotent per `(business_id, client_reference)`, dashboard backend-owned, gate tujuh hari, golden transaction analytics, dan insight rule-versioned. Router hanya memanggil service; repository menerima scope tenant.

Verifikasi lokal 14 Agustus 2026: Ruff, format check, mypy, dan 28 test lulus. PostgreSQL mencapai Alembic `0005`; `alembic check` melaporkan tidak ada schema drift. Smoke test container lulus untuk register, refresh rotation, pembuatan usaha dan produk, transaksi dengan total backend Rp36.000, serta dashboard. Bug migrasi `memberships.created_at` yang ditemukan smoke test sudah ditutup lewat migrasi korektif `0004`.

Spike OASIS ditempatkan terisolasi di `spikes/oasis` dengan environment dan lockfile sendiri karena `camel-oasis==0.2.5` mengunci `pytest-asyncio==0.23.6`, sedangkan dependency transitif `mcp` perlu dibatasi `<2` agar `camel-ai==0.2.78` dapat diimpor. Spike sudah memiliki empat profil agent, schema artifact dan ballot, trace unik, hard limit, metrik token dan durasi, serta finance integer-rupiah deterministik. Dependency probe dan lima test spike lulus. Run Gemini live dan benchmark berulang belum dijalankan karena `GEMINI_API_KEY` belum tersedia; Fase 0 belum memenuhi exit criteria sampai hasil nyata dicatat di `docs/14`.

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

**Terdampak.** Memblokir Fase 3 pada `docs/16`, karena evidence snapshot builder tidak dapat dibangun tanpa sumber yang jelas.

**Status:** belum diputuskan.

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

---

## Langkah berikutnya

Rencana lengkap ada di `docs/16`. Yang harus dibereskan lebih dulu, berurutan:

1. Tuntaskan sisa Fase 0 saat Gemini API key tersedia: jalankan spike berulang dan catat benchmark nyata ke `docs/14`.
2. Sebelum Fase 3, product owner perlu memutuskan sumber data kompetitor produksi. Jalur analisis deterministik tidak boleh memakai fixture sebagai evidence nyata.

---

## Yang perlu diketahui saat bekerja di repo ini

- Aturan lengkap ada di `AGENTS.md` tiap repository. Lima aturan inti: LLM tidak pernah jadi sumber angka otoritatif; setiap angka punya provenance; kegagalan parsial tidak disamarkan; uang selalu integer rupiah; data pengguna tidak bocor ke prompt.
- **Dokumen menang atas kode.** Kalau kode menyimpang dari `Docs`, yang salah kode — kecuali ada ADR.
- Teks yang dilihat pengguna Bahasa Indonesia; kode, nama file, dan commit message Bahasa Inggris.
- **Commit signing aktif** (GPG). Kalau `gpg: signing failed: Timeout` muncul, cache passphrase-nya habis — buka terminal interaktif, jalankan `echo test | gpg --clearsign`, lalu ulangi. Jangan pakai `--no-gpg-sign` tanpa izin pemilik.
- **Status pengembangan tidak boleh bocor ke UI.** Tidak ada teks semacam "fitur belum tersedia" di halaman pengguna. Badge `MODE DEMO` di dalam `/demo` adalah pengecualian yang disengaja karena menandai data contoh.
