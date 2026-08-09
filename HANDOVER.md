# Handover

Catatan keadaan proyek untuk serah terima antarsesi. Diperbarui setiap sesi berakhir.

**Terakhir diperbarui:** 9 Agustus 2026

---

## Cara memakai dokumen ini

Baca bagian **Keadaan sekarang** dan **Keputusan yang menunggu** lebih dulu. Sisanya konteks.

Di akhir sesi, perbarui: tanggal di atas, tabel Keadaan sekarang, dan bagian Sudah selesai. Keputusan yang baru dijawab pemilik dipindahkan dari *menunggu* ke *sudah diambil* beserta konsekuensinya. Kalau muncul pertanyaan baru yang menyangkut scope, prioritas, atau data pengguna, tambahkan ke *menunggu* — jangan diputuskan sendiri.

---

## Keadaan sekarang

| Repository | Branch | Commit | Belum di-commit |
|---|---|---|---|
| `Docs` | `main` | `HEAD` | bersih setelah handover ini |
| `SimuMarketAI` (frontend) | `feat/dashboard` | `144f181` | bersih |
| `SimuMarketAI-BE` | `main` | `2e234bc` | bersih, belum ada kode |

**Frontend aktif di `feat/dashboard`** dan sudah di-push ke `origin/feat/dashboard`.

**Live:** https://simumarket-ai.vercel.app — deploy production dari push ke `main` dijalankan GitHub Actions dengan credential Vercel yang disimpan sebagai GitHub Secrets.

---

## Sudah selesai

### Dokumentasi (`Docs`)

- `01`–`11` sudah ada sejak awal proyek.
- `12` workflow aplikasi, `13` UI system dan rencana mock, `14` keputusan tech stack — dibuat di sesi ini.
- `15` dashboard dan app shell memuat rancangan sidebar, empat keadaan blok utama, destination operasional, dan tabel hak akses per peran.
- `HANDOVER.md` (dokumen ini) menjadi catatan keadaan lintas sesi.
- `ADR-002` menaikkan frontend ke Next.js 16 karena 14 sudah end of life. Status Accepted.
- `AGENTS.md` + `CLAUDE.md` di ketiga repository. Masing-masing berdiri sendiri: lima aturan inti ditulis ulang di tiap repo supaya clone tunggal tetap membawanya.

### Frontend (`SimuMarketAI`, branch `feat/dashboard`)

Next.js 16 + React 19 + Tailwind v4. `tsc --noEmit` bersih, build lolos, seluruh rute 200.

**Aplikasi sebenarnya:**
- `/` landing sinematik — lima adegan penuh layar, transisi dipicu gerakan (bukan gulir), batas larut bertekstur, parallax tiga lapis.
- `/login` halaman masuk. Formnya belum tersambung ke apa pun.

**Demo (`/demo/*`), seluruhnya data contoh:**
- Journey A: `/demo/analisis/input` (peta, produk, modal) → `/demo/edukasi` (gerbang F-09) → `/demo/analisis/konfirmasi` → `/demo/analisis/proses` (empat agent) → `/demo/laporan/{id}` → `/demo/diskusi`.
- Workspace: dashboard, analitik komposit dan per usaha, katalog produk per usaha, riwayat analisis, serta riwayat laporan memakai app shell tetap dan tidak menjalankan autoplay.
- Journey B: `/demo/transaksi/produk` → `/demo/transaksi/catat` (*Transaction Management*) dengan cabang input manual atau `/demo/transaksi/struk` → gate tujuh hari → `/demo/transaksi/analitik` (ranking produk, tren mingguan, sebaran per jam, rekomendasi, dan ekspor).
- Demo terisolasi di `src/app/demo/` dan `src/demo/`. Menghapus keduanya tidak merusak aplikasi.

### Backend (`SimuMarketAI-BE`)

Belum ada kode. Baru README dan aturan coding.

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

---

## Keputusan yang menunggu product owner

Yang **tidak boleh diputuskan sendiri** oleh sesi berikutnya.

### 1. Cara mengundang kasir

Belum ada di dokumen mana pun. Pilihan: undangan lewat email, kode undangan, atau akun dibuatkan pemilik. Menyentuh alur autentikasi dan privasi.

**Terdampak.** Skema user, `/login`, dan halaman pengaturan usaha yang belum dirancang.

**Status:** belum diputuskan.

### 2. Batas jumlah usaha per akun

Tanpa batas, satu akun bisa membuat ratusan usaha dan menghabiskan kuota analisis. Perlu angka wajar, atau dikaitkan dengan model bisnis freemium di proposal §5.10.

**Status:** belum diputuskan.

---

## Catatan yang harus dibawa, jangan dilupakan

Hal-hal yang sudah diputuskan tetapi mudah terlewat dan berakibat.

### Penyempitan scope yang harus disebut apa adanya di laporan akhir

- **Jenis usaha dihapus dari alur** atas instruksi pemilik, karena produk memang khusus F&B. Akibatnya **F-03 tinggal separuh** (hanya lokasi), dan **F-08** menampilkan empat topik edukasi yang sama untuk semua pengguna alih-alih dikurasi per jenis usaha. Tercatat di `SimuMarketAI/DEMO-PLAN.md`. Jangan diklaim terpenuhi.
- **F-10A (foto struk)** tidak ada di tabel kebutuhan fungsional proposal — itu elaborasi di repo `Docs`. Di demo diperlakukan sebagai opsi input kedua, bukan requirement Must.

### Versi dan lisensi

- **Python dikunci di 3.11** oleh `camel-oasis` 0.2.5, bukan karena preferensi. Jangan "membantu" menaikkannya.
- **Gemini 2.5 keluar dari GA pada 16 Oktober 2026.** Model default dipilih `gemini-3.1-flash-lite`. Model berlabel `-preview` dilarang untuk jalur demo.
- **Peta pada demo memakai Leaflet dan tile OpenStreetMap.** Lokasi dan kompetitor tetap fixture demo; pemakaian penyedia data bisnis nyata masih menunggu review lisensi (lihat `docs/05`).
- **Video edukasi belum ditentukan.** Yang ada baru pemutar kosong.

### Utang teknis

- `lenis` masih di `package.json` tetapi **tidak terpakai** setelah transisi landing berpindah dari berbasis gulir ke berbasis pemicu. Sudah tidak masuk bundle. Aman dicopot.
- `GET /v1/dashboard` perlu tambahan field `keadaan` sesuai `docs/15`. **`docs/06` belum diperbarui** — perbarui pada commit yang sama saat dashboard dikerjakan.
- Script `lint` frontend masih memakai `next lint`, yang tidak tersedia pada Next.js 16; script test juga belum didefinisikan di `package.json`.

---

## Langkah berikutnya yang disarankan

Urutan ini mengikuti risiko, bukan kemudahan.

1. **Merge `feat/dashboard` ke `main`** di repository frontend setelah review UI.
2. **Perbarui `docs/06`** dengan field `keadaan` dan scoping `business_id`, sebelum backend menyentuh endpoint dashboard.
3. Tegakkan RBAC di backend; pergantian peran frontend saat ini hanya kontrol mode demo.
4. **Perbaiki konfigurasi lint dan test frontend** agar sesuai Next.js 16 dan perintah wajib repository dapat dijalankan.
5. **Mulai backend.** Roadmap di `docs/09` menempatkan spike OASIS sebagai risiko pertama, bukan integrasi terakhir.

---

## Yang perlu diketahui saat bekerja di repo ini

- Aturan lengkap ada di `AGENTS.md` tiap repository. Lima aturan inti: LLM tidak pernah jadi sumber angka otoritatif; setiap angka punya provenance; kegagalan parsial tidak disamarkan; uang selalu integer rupiah; data pengguna tidak bocor ke prompt.
- **Dokumen menang atas kode.** Kalau kode menyimpang dari `Docs`, yang salah kode — kecuali ada ADR.
- Teks yang dilihat pengguna Bahasa Indonesia; kode, nama file, dan commit message Bahasa Inggris.
- **Commit signing aktif** (GPG). Kalau `gpg: signing failed: Timeout` muncul, cache passphrase-nya habis — buka terminal interaktif, jalankan `echo test | gpg --clearsign`, lalu ulangi. Jangan pakai `--no-gpg-sign` tanpa izin pemilik.
- **Status pengembangan tidak boleh bocor ke UI.** Tidak ada teks semacam "fitur belum tersedia" di halaman pengguna. Badge `MODE DEMO` di dalam `/demo` adalah pengecualian yang disengaja karena menandai data contoh.
