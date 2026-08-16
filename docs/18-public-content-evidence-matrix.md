# Matriks Evidence Konten Publik

## Tujuan

Matriks ini mengikat setiap kelompok halaman Fumadocs ke sumber yang dapat diperiksa. Halaman publik tidak boleh mengubah status target menjadi implementasi, menyebut seed sebagai fakta pasar, atau menyalin kontrak yang berbeda dari kode.

Baseline implementasi yang diperiksa pada **16 Agustus 2026**:

| Repository | Branch audit | Commit |
|---|---|---|
| Frontend | `feat/phase5-receipt-export` | `ac358ee` |
| Backend | `feat/phase5-receipt-export` | `2ec6bb8` |
| Docs | `main` | working tree sebelum website dokumentasi |

Nomor phase hanya dipakai pada repository untuk delivery tracking. Website publik menyebut kapabilitas produk tanpa nomor phase.

## Kosakata status

| Status | Arti pada dokumentasi publik |
|---|---|
| `implemented` | Ada pada kode dan mempunyai verifikasi yang relevan |
| `demo` | Ada sebagai interactive prototype atau seed data, bukan integrasi produksi |
| `planned` | Ditentukan pada requirement atau arsitektur tetapi belum tersedia pada baseline kode |
| `unavailable` | Integrasi sengaja mengembalikan keadaan tidak tersedia |
| `unvalidated` | Sudah diimplementasikan tetapi parameter atau kualitasnya belum mendapat validasi pakar/pilot |

## Matriks halaman

| Kelompok halaman | Sumber produk | Bukti implementasi utama | Status yang wajib dijelaskan |
|---|---|---|---|
| Pengantar dan lifecycle | `01`, `12`, `16` | route dan navigation frontend | Decision Support System; demo berbeda dari produksi |
| Peran owner dan cashier | `06`, `12`, `15`, `16` | `workspace-access.ts`, auth dan RBAC test | dua role aktif; cashier tenant-scoped |
| Edukasi | `01`, `06`, `12` | education API, contract, route, dan test | gate aktif; konten kosong dapat menghasilkan warning |
| Market Analysis | `02` sampai `06`, `12` | analysis service, pipeline, worker, SSE, contract, E2E | asynchronous; dapat selesai `partial` |
| OASIS councils | `03`, `04`, ADR-001, ADR-004 | `app/integrations/oasis`, orchestration test | fake teruji; live Gemini belum diverifikasi tanpa key |
| Finance dan scoring | `05`, ADR-003 | deterministic engines dan golden test | `lrs-v0.2-unvalidated`; missing dimension tidak diimputasi |
| Evidence | `05`, `07` | evidence domain/provider dan validation test | production provider pasar masih `unavailable` |
| Usaha, produk, transaksi | `06`, `10`, `12`, `15` | operations API, repository, UI, RBAC dan analytics test | transaksi dan analytics deterministik |
| Foto struk | `02`, `06`, `07`, `10`, `12`, `14`, `16` | receipt service, Paddle adapter, worker, UI, E2E | review manusia wajib; akurasi struk nyata belum dikalibrasi |
| PDF export | `06`, `10`, `11`, `16` | export service, worker, UI dan test | asynchronous, private, signed URL, retention |
| Setup developer | `11`, `14`, README kode | package files, Docker Compose, migration, test commands | fake adapter tidak memerlukan Gemini key |
| Arsitektur dan code structure | `02`, `03`, `10`, ADR | import boundary, folder code, migration | Docs menang bila terjadi penyimpangan tanpa ADR |
| Security dan privacy | `07`, `11` | sanitizer, upload validation, tenant query, tests | raw receipt dan PII tidak masuk prompt |
| Design system | `13`, `15` | `globals.css`, UI components, AppShell | website docs merangkum produk, bukan menyalin demo |
| API reference | `06` | FastAPI OpenAPI dan Pydantic schema | schema generated menjadi referensi bentuk payload |
| Deployment | `11`, `14`, `16` | Dockerfile, Compose, workflow files | topologi target dibedakan dari local development |
| ADR | `docs/adr/` | keputusan dan validation section masing-masing | keputusan aktif dan konsekuensi negatif tetap terlihat |

## Sumber eksternal primer

Klaim mengenai framework atau provider harus diperiksa pada dokumentasi resmi. Sumber minimum:

- Fumadocs untuk content source, i18n, search, dan OpenAPI integration.
- Next.js untuk App Router, runtime, build, dan route convention.
- Vercel untuk Root Directory dan deployment project.
- FastAPI dan Pydantic untuk OpenAPI serta validation.
- Celery untuk worker, queue, retry, dan periodic task.
- PostgreSQL, Redis, dan MinIO untuk perilaku storage terkait.
- OASIS/CAMEL untuk simulation environment dan agent runtime.
- PaddleOCR untuk PP-StructureV3.
- Google AI for Developers untuk model Gemini ketika live provider diuji.

Gunakan dokumentasi primer terlebih dahulu. Catat tanggal pemeriksaan untuk versi dan klaim yang dapat berubah.

## Aturan parity bahasa

Bahasa Indonesia adalah sumber editorial. Halaman `.en.mdx` dibuat setelah versi Indonesia lolos technical review. Pasangan locale wajib mempunyai:

- status implementasi yang sama;
- angka, bobot, formula, endpoint, dan state yang sama;
- disclaimer dan limitation yang sama;
- tanggal verifikasi yang sama;
- link sumber yang ekuivalen.

Field, route, identifier, dan code tetap menggunakan Bahasa Inggris pada kedua locale.

