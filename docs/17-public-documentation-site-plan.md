# Rencana Website Dokumentasi Publik

## 1. Tujuan

SimuMarket AI memerlukan website dokumentasi publik yang menjelaskan produk dari sudut pandang pengguna, developer, reviewer kompetisi, dan calon kontributor. Website harus lebih mudah dibaca daripada kumpulan dokumen perencanaan internal, tetapi tetap konsisten dengan sumber kebenaran teknis di repository ini.

Website dibangun dengan Fumadocs dan Next.js, kemudian di-deploy melalui Vercel. Domain target awal adalah `simumarket-docs.vercel.app`.

Dokumentasi publik bersifat terbuka. Tidak ada halaman yang memerlukan login. Pemisahan konten dilakukan untuk menjaga fokus pembaca, bukan untuk menyembunyikan informasi rahasia.

Website menyediakan Bahasa Indonesia dan Bahasa Inggris melalui language switcher. Bahasa Indonesia menjadi default locale. Versi Bahasa Inggris disediakan sebagai konten terkurasi, bukan hasil terjemahan otomatis pada browser.

## 2. Prinsip dokumentasi

1. Website menjelaskan produk yang dapat digunakan dan diverifikasi, bukan persentase progress.
2. Dokumen teknis di `docs/` tetap menjadi sumber kebenaran bagi requirement, arsitektur, kontrak, dan keputusan.
3. Halaman publik menyajikan kembali informasi berdasarkan kebutuhan pembaca tanpa mengubah makna dokumen sumber.
4. Klaim implementasi harus dibedakan dari target arsitektur dan pekerjaan yang belum tervalidasi.
5. Angka finansial, scoring, evidence, kegagalan parsial, integer rupiah, dan privacy boundary harus mengikuti lima aturan utama produk.
6. Contoh payload, transaksi, struk, dan laporan hanya menggunakan data sintetis yang telah disanitasi.
7. Bahasa Indonesia adalah default locale dan Bahasa Inggris adalah secondary locale. Nama field, endpoint, class, state, dan istilah kode tetap menggunakan Bahasa Inggris pada keduanya.
8. Kedua locale harus menyampaikan makna, limitation, dan status validasi yang sama.

## 3. Pemisahan konten repository dan website

Repository `Docs` tetap menyimpan dua kelompok informasi.

| Kelompok | Lokasi | Tampil di Fumadocs | Fungsi |
|---|---|---:|---|
| Sumber kebenaran teknis | `docs/` | Dipilih secara kurasi | Requirement, arsitektur, kontrak, security, dan ADR |
| Dokumentasi publik | `website/content/docs/` | Ya | Panduan pengguna dan developer yang mudah dinavigasi |
| Progress dan delivery | `docs/09-mvp-roadmap.md`, `HANDOVER.md` | Tidak | Pelacakan phase, pekerjaan tersisa, dan serah terima |
| Instruksi agent | `AGENTS.md`, `CLAUDE.md` | Tidak | Aturan kerja automation dan coding agent |
| Aplikasi dokumentasi | `website/` | Bukan konten | Source code Fumadocs, konfigurasi, komponen, dan aset publik |

`HANDOVER.md`, roadmap, dan catatan progress tetap dapat dibaca melalui repository apabila repository bersifat publik. File tersebut tidak dimasukkan ke content source, sidebar, search index, sitemap, atau build Fumadocs karena tidak membantu pembaca memahami cara menggunakan dan mengembangkan produk.

## 4. Target pembaca

| Pembaca | Pertanyaan utama | Jalur dokumentasi |
|---|---|---|
| Calon pengusaha F&B | Bagaimana menilai rencana usaha sebelum diluncurkan? | Pengantar dan Panduan Pengguna |
| Pemilik usaha | Bagaimana mengelola produk, transaksi, analytics, dan laporan? | Panduan Pengguna |
| Kasir | Bagaimana mencatat transaksi tanpa mengakses pengaturan owner? | Panduan Pengguna |
| Juri dan reviewer | Apa masalah, metode, batasan, dan kejujuran hasil sistem? | Konsep Produk dan Arsitektur |
| Developer | Bagaimana menjalankan seluruh sistem dan memahami codebase? | Setup Developer dan Engineering |
| Kontributor | Standar apa yang wajib diikuti sebelum mengubah kode? | Engineering dan Kontribusi |
| Pembaca internasional | Bagaimana memahami produk dan arsitektur tanpa Bahasa Indonesia? | Seluruh halaman melalui locale Bahasa Inggris |

## 5. Arsitektur informasi publik

### 5.1 Pengantar

- Apa itu SimuMarket AI.
- Masalah UMKM F&B yang ditangani.
- Lifecycle `Learn -> Analyse -> Launch -> Record -> Understand -> Improve`.
- Perbedaan mode demo, seed data, dan integrasi produksi.
- Status sebagai Decision Support System, bukan pemberi jaminan keberhasilan.
- Istilah utama dan repository map.

### 5.2 Panduan Pengguna

- Membuat akun dan masuk.
- Memahami peran owner dan cashier.
- Menyelesaikan edukasi yang menjadi prerequisite.
- Membuat Market Analysis.
- Memilih lokasi, produk, harga, dan modal.
- Memahami proses council OASIS dan state analisis.
- Membaca Launch Readiness Score, evidence confidence, risiko, dan limitation.
- Membandingkan scenario.
- Mengelola usaha dan produk.
- Mencatat transaksi manual.
- Mengimpor foto struk, mengoreksi hasil OCR, dan mengonfirmasi transaksi.
- Membaca transaction analytics.
- Mengunduh laporan PDF.
- Menangani loading, empty, error, expired, dan `partial` state.

### 5.3 Setup Developer

- Prasyarat Node.js, Python, `uv`, Docker, dan Git.
- Clone repository frontend, backend, dan Docs.
- Menyiapkan environment variables menggunakan file contoh tanpa secret nyata.
- Menjalankan PostgreSQL, Redis, dan MinIO.
- Menjalankan migration database.
- Menjalankan FastAPI, Celery worker, dan Celery beat.
- Menjalankan frontend Next.js.
- Menjalankan website Fumadocs.
- Menggunakan fake adapter dan seed data tanpa Gemini API key.
- Menjalankan live provider ketika credential tersedia.
- Menjalankan lint, typecheck, unit test, integration test, E2E, dan production build.
- Troubleshooting masalah setup yang umum.

### 5.4 Arsitektur Sistem

- Context diagram dan tanggung jawab setiap repository.
- Frontend, API, worker, PostgreSQL, Redis, object storage, evidence provider, dan OASIS.
- Analysis state machine dan recovery.
- Empat council: Market Analyst, Customer Persona, Finance, dan Report.
- Batas OASIS dengan deterministic engine.
- Evidence provenance dan missing evidence.
- Financial engine dan Launch Readiness Score.
- Asynchronous job, SSE, idempotency, dan correlation ID.
- Receipt OCR review flow.
- PDF artifact generation dan retention.
- Authentication, RBAC, tenant isolation, dan privacy boundary.

### 5.5 Code Structure dan Design Pattern

- Struktur feature pada frontend.
- Pemisahan page, component, contract, dan API client.
- Struktur domain, schema, repository, service, engine, integration, API, dan worker pada backend.
- Repository pattern untuk akses data tenant-scoped.
- Service layer untuk orchestration use case.
- Adapter dan protocol untuk provider eksternal.
- Deterministic engine sebagai pemilik angka otoritatif.
- DTO dan schema validation pada batas sistem.
- Background worker untuk proses lambat.
- Idempotency untuk operasi yang dapat diulang.
- Structured error dan partial failure.
- Aturan dependency direction dan larangan import lintas repository.

### 5.6 Standar Engineering

- Code dan commit message menggunakan Bahasa Inggris.
- Teks yang dilihat pengguna menggunakan Bahasa Indonesia.
- Uang selalu integer rupiah.
- Angka yang tampil harus memiliki provenance.
- LLM tidak menghitung angka otoritatif.
- Raw receipt dan data pelanggan tidak masuk prompt.
- Requirement dan perubahan yang memerlukan ADR.
- Migration yang reversible dan terverifikasi.
- Contract-first integration antara backend dan frontend.
- Testing strategy dan aturan pelaporan kegagalan.
- Security checklist sebelum deployment.
- Conventional commit dan satu commit untuk satu perubahan logis.

### 5.7 Design System

- Brand, color token, typography Montserrat, spacing, radius, dan elevation.
- App shell, sidebar, mobile navigation, card, table, form, dialog, dan feedback component.
- Pola loading, empty, error, success, warning, `partial`, dan unavailable.
- Responsive behaviour dan keyboard navigation.
- Contrast, focus state, semantic HTML, dan accessible label.
- Standar copy Bahasa Indonesia dan larangan em dash pada teks produk.
- Perbedaan visual antara data nyata, seed data, simulasi, dan informasi yang belum tersedia.

### 5.8 API Reference

- Authentication dan actor context.
- Business, product, transaction, education, analysis, event, receipt import, dan export endpoint.
- Request dan response berdasarkan schema backend.
- Status code dan structured error.
- Idempotency key dan correlation ID.
- SSE reconnect menggunakan `Last-Event-ID`.
- Contoh payload sintetis tanpa data pengguna.
- Tautan ke kontrak lengkap dan OpenAPI ketika environment tersedia.

### 5.9 Deployment dan Operasional

- Deployment website dokumentasi ke Vercel.
- Deployment frontend ke Vercel.
- Deployment API, worker, beat, database, Redis, dan object storage.
- Environment configuration per development, staging, dan production.
- Health check, logging, metrics, tracing, alerting, backup, dan recovery.
- Retention artifact dan penghapusan data.
- Production readiness checklist.

### 5.10 Keputusan Arsitektur

- Indeks ADR.
- Ringkasan keputusan yang masih aktif.
- Konsekuensi positif dan negatif.
- Tautan ke ADR lengkap di repository.
- Penanda `Superseded` untuk keputusan yang sudah diganti.

## 6. Struktur direktori target

```text
Docs/
|-- docs/                         # sumber kebenaran teknis dan progress
|-- website/
|   |-- app/                      # Next.js App Router
|   |-- components/               # komponen khusus dokumentasi
|   |-- content/
|   |   `-- docs/
|   |       |-- index.mdx
|   |       |-- pengantar/
|   |       |-- panduan-pengguna/
|   |       |-- setup-developer/
|   |       |-- arsitektur/
|   |       |-- engineering/
|   |       |-- design-system/
|   |       |-- api/
|   |       |-- deployment/
|   |       `-- keputusan/
|   |-- lib/
|   |   `-- i18n.ts               # locale id dan en
|   |-- public/
|   |-- source.config.ts
|   |-- next.config.ts
|   |-- package.json
|   `-- vercel.json               # hanya bila konfigurasi default tidak cukup
|-- HANDOVER.md
|-- AGENTS.md
`-- README.md
```

Nama direktori dan file source code menggunakan Bahasa Inggris apabila berisi kode. Slug halaman publik dapat menggunakan Bahasa Indonesia agar konsisten dengan bahasa dokumentasi.

Konten default menggunakan nama file tanpa suffix locale. Terjemahan Bahasa Inggris menggunakan suffix `.en`, sesuai mekanisme localized content Fumadocs.

```text
website/content/docs/
|-- index.mdx                     # Bahasa Indonesia
|-- index.en.mdx                  # Bahasa Inggris
|-- pengantar.mdx                 # Bahasa Indonesia
`-- pengantar.en.mdx              # Bahasa Inggris
```

Routing menggunakan Bahasa Indonesia tanpa prefix locale dan Bahasa Inggris dengan prefix `/en`. Kedua locale memakai slug yang sama, misalnya `/docs/pengantar/produk` dan `/en/docs/pengantar/produk`, agar language switcher selalu mempunyai pasangan halaman yang deterministik.

## 7. Strategi sumber kebenaran

Website publik tidak boleh menjadi salinan bebas yang kemudian menyimpang dari dokumen teknis. Setiap kelompok halaman mempunyai sumber utama.

| Halaman publik | Sumber utama |
|---|---|
| Konsep produk dan requirement | `01`, `12`, `16` |
| Arsitektur sistem | `02`, `10`, `11` |
| OASIS dan simulasi | `03`, `04`, ADR-001, ADR-004 |
| Evidence, finance, dan scoring | `05`, ADR-003 |
| API reference | `06` dan schema backend |
| Security dan privacy | `07` |
| Testing | `08` |
| Design system | `13`, `15` |
| Tech stack dan setup | `14`, README frontend, README backend |

Perubahan kontrak atau arsitektur dilakukan pada dokumen sumber terlebih dahulu. Halaman Fumadocs yang merangkum informasi tersebut diperbarui pada perubahan logis yang sama.

## 8. Desain dan pengalaman membaca

- Gunakan Fumadocs UI sebagai baseline, lalu terapkan brand SimuMarket AI secara terbatas.
- Pertahankan tampilan ringan dengan sidebar, table of contents, breadcrumb, search, dan dark mode.
- Gunakan diagram Mermaid atau blok `text`, bukan gambar biner untuk diagram teknis.
- Gunakan callout konsisten untuk `Catatan`, `Peringatan`, `Batasan`, dan `Belum divalidasi`.
- Tampilkan jalur cepat berdasarkan persona pada halaman awal.
- Sediakan tombol menuju aplikasi demo dan repository GitHub.
- Sediakan language switcher `Bahasa Indonesia` dan `English` pada layout dokumentasi.
- Hindari animasi yang tidak membantu pemahaman.
- Pastikan halaman dapat digunakan melalui keyboard dan tetap terbaca pada layar kecil.

Fumadocs menangani locale-aware routing, navigation, search integration, dan translation label untuk komponen UI. Isi halaman tetap ditulis dan ditinjau dalam dua bahasa. Fitur ini bukan tombol yang mengirim konten ke layanan machine translation saat halaman dibuka.

## 9. Search dan discoverability

- Search index hanya mencakup `website/content/docs/`.
- Search berjalan pada locale aktif dan tidak mencampur hasil Bahasa Indonesia dengan Bahasa Inggris.
- Roadmap, handover, dan instruksi agent tidak masuk hasil pencarian.
- Setiap halaman memiliki title, description, dan heading hierarchy yang jelas.
- Buat sitemap, canonical URL, metadata locale, dan `hreflang` untuk deployment publik.
- Tambahkan `llms.txt` hanya jika isinya dibangun dari halaman publik yang sama.
- Hindari mengindeks nilai seed sebagai fakta pasar nyata.

## 10. Deployment Vercel

Repository `Docs` dihubungkan ke project Vercel terpisah dengan konfigurasi berikut.

| Pengaturan | Nilai |
|---|---|
| Project name | `simumarket-docs` |
| Production domain | `simumarket-docs.vercel.app` |
| Root Directory | `website` |
| Framework Preset | Next.js |
| Production branch | `main` |
| Preview deployment | Aktif untuk pull request dan branch non-production |

Website dokumentasi tidak membutuhkan backend, database, Redis, object storage, atau Gemini API key. Build hanya memerlukan dependency website dan konten Markdown/MDX.

## 11. Tahapan implementasi

### Tahap A: Fondasi

- Scaffold Next.js dan Fumadocs di `website/`.
- Konfigurasi content source, locale `id` dan `en`, language switcher, navigation metadata, theme, search, dan local development.
- Tambahkan landing page dokumentasi dan repository links.
- Pastikan hanya direktori konten publik yang masuk build.

### Tahap B: Dokumentasi pengguna

- Tulis pengantar produk.
- Tulis jalur calon pengusaha, owner, dan cashier.
- Dokumentasikan analisis, laporan, transaksi manual, receipt OCR, dan analytics.
- Tambahkan state, limitation, dan disclaimer yang relevan.
- Tulis dan review pasangan konten Bahasa Indonesia dan Bahasa Inggris untuk setiap halaman pengguna.

### Tahap C: Dokumentasi developer

- Tulis setup end-to-end ketiga repository.
- Dokumentasikan code structure, design pattern, contract, testing, dan contribution workflow.
- Dokumentasikan fake, unavailable, dan live provider tanpa memasukkan credential.
- Tulis dan review pasangan konten Bahasa Indonesia dan Bahasa Inggris untuk setiap halaman developer.

### Tahap D: Referensi teknis

- Tulis ringkasan arsitektur, OASIS, deterministic engine, evidence, security, dan deployment.
- Susun API reference dari kontrak yang sudah ada.
- Tambahkan indeks ADR tanpa menampilkan roadmap sebagai dokumentasi produk.

### Tahap E: Quality gate dan rilis

- Jalankan lint, typecheck, link check, dan production build.
- Periksa responsive layout, keyboard navigation, contrast, dark mode, dan search.
- Periksa language switcher, locale-aware routing, metadata, dan kesetaraan makna kedua bahasa.
- Verifikasi tidak ada secret, data pengguna, trace, PDF, atau foto struk di build.
- Hubungkan project ke Vercel dan validasi preview deployment.
- Rilis ke `simumarket-docs.vercel.app` setelah seluruh quality gate lulus.

## 12. Quality gate

Website siap dipublikasikan apabila:

1. Seluruh navigation link dan internal link valid.
2. Production build berhasil dari direktori `website/`.
3. Search hanya menemukan halaman publik.
4. Tidak ada phase progress, handover, atau instruksi agent pada sidebar dan search index.
5. Tidak ada secret atau data pengguna nyata dalam source dan output build.
6. Seluruh contoh uang menggunakan integer rupiah.
7. Seluruh contoh angka pasar memiliki label synthetic atau provenance yang sesuai.
8. Disclaimer Decision Support System terlihat pada halaman hasil dan konsep produk.
9. Halaman utama dapat mengarahkan setiap target pembaca ke jalur yang sesuai.
10. Tampilan mobile, dark mode, focus state, dan keyboard navigation telah diperiksa.
11. Language switcher mempertahankan halaman ekuivalen ketika locale diganti.
12. Setiap halaman Bahasa Indonesia mempunyai pasangan Bahasa Inggris, dan sebaliknya.
13. Search, canonical URL, sitemap, dan metadata bekerja sesuai locale aktif.

## 13. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Konten publik menyimpang dari dokumen teknis | Pembaca menerima informasi yang berbeda | Tetapkan mapping sumber dan perbarui keduanya dalam satu perubahan logis |
| Seluruh dokumen internal ikut terindeks | Website dipenuhi progress yang tidak relevan | Batasi content source ke `website/content/docs/` |
| Dokumentasi menyatakan target sebagai fitur selesai | Klaim produk menjadi tidak jujur | Gunakan label implemented, demo, planned, unavailable, dan unvalidated |
| Setup cepat menjadi usang | Developer baru gagal menjalankan sistem | Uji langkah setup pada environment bersih dan pin dependency |
| Terjemahan tertinggal dari dokumen default | Kedua locale menyampaikan perilaku berbeda | Wajibkan pembaruan pasangan locale dalam satu perubahan logis dan periksa parity pada CI |
| Contoh memuat data sensitif | Pelanggaran privacy | Gunakan fixture sintetis dan lakukan secret scan sebelum build |
| Custom theme terlalu besar | Maintenance website meningkat | Mulai dari Fumadocs UI dan ubah hanya token brand yang diperlukan |

## 14. Di luar rilis pertama

- Dokumentasi versioning per release.
- CMS eksternal.
- Search service berbayar.
- Playground API yang mengirim request ke production.
- Dashboard progress development pada website publik.
- Authentication khusus dokumentasi.

Fitur tersebut dapat ditambahkan setelah konten inti stabil dan kebutuhan nyata telah terbukti.
