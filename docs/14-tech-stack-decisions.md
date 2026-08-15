# Keputusan Tech Stack dan Version Pinning

Dokumen ini mencatat versi konkret yang dipakai, alasannya, dan risiko yang menyertainya. Baseline teknologi pada [technical requirements](01-technical-requirements-traceability.md) bersifat fixed pada level *layer*; dokumen ini menetapkan *versi* di dalam layer itu.

Diverifikasi pada **6 Agustus 2026**. Setiap versi wajib diverifikasi ulang sebelum Sprint 0 dikunci.

## Ringkasan pin

| Layer | Pin | Catatan |
|---|---|---|
| Runtime frontend | Node 22 LTS | |
| Framework frontend | Next.js 16.x | **berubah dari 14** — lihat ADR-002 |
| UI runtime | React 19 | dibawa oleh Next 15+ |
| Bahasa frontend | TypeScript 5.x, `strict: true` | |
| Styling | Tailwind CSS v4 | konfigurasi CSS-first via `@theme` |
| Runtime backend | **Python 3.11** | ditentukan oleh OASIS, bukan preferensi |
| Framework backend | FastAPI 0.136.x + Pydantic 2.x | |
| Simulasi agent | `camel-oasis` 0.2.5 | rilis terakhir 4 Des 2025 |
| Model interface | `camel-ai` 0.2.78 | ditarik oleh oasis 0.2.5 |
| Kompatibilitas MCP worker | `mcp` 1.29.0, constraint `<2` | MCP 2.0 menghapus lokasi import `FastMCP` yang masih dipakai CAMEL 0.2.78; diverifikasi lewat import probe 15 Agustus 2026 |
| LLM | `gemini-3.1-flash-lite` | **berubah dari 2.5** — lihat risiko di bawah |
| Structured output | LangChain (versi dipin saat spike) | di luar loop social interaction |
| Database | PostgreSQL 16 + pgvector | |
| Queue | Redis 7 + Celery 5.x | |
| OCR | PaddleOCR (PP-StructureV3) | |

## Tiga temuan yang mengubah rencana

### 1. Next.js 14 sudah end-of-life

Proposal menetapkan Next.js 14. Versi itu **mencapai EOL pada 26 Oktober 2025** dan menerima patch terakhir `14.2.35` pada Desember 2025. Versi stabil saat ini adalah **16.3** (3 Agustus 2026).

Konsekuensi bila tetap di 14:

- tidak ada patch keamanan; kerentanan yang ditemukan setelah Desember 2025 tidak akan diperbaiki;
- juri yang memeriksa `package.json` dapat menandainya sebagai kelalaian teknis, bukan sebagai kepatuhan pada proposal;
- React tertahan di 18, sehingga sebagian pustaka baru tidak dapat dipakai.

Keputusan dan alasannya ada di [ADR-002](adr/ADR-002-frontend-framework-version.md). Requirement fungsional tidak berubah; hanya versi implementasinya.

### 2. OASIS mengunci Python di 3.11

`camel-oasis` 0.2.5 adalah rilis terakhir, **4 Desember 2025** — paket tidak bergerak selama delapan bulan. Audit tim mencatat requirement `>=3.10,<3.12`.

Artinya Python 3.11 **bukan pilihan gaya**. Untuk proyek FastAPI baru pada 2026, 3.12 atau 3.13 adalah default yang lebih wajar; OASIS-lah yang menahan kita di 3.11. Catat ini di README backend agar tidak ada yang "membantu" meng-upgrade dan merusak simulasi.

Risiko yang menyertai paket yang stagnan:

- perbaikan bug hulu kemungkinan tidak datang selama masa lomba;
- setiap incompatibility harus diselesaikan di **adapter kita sendiri** atau fork terkontrol, sesuai [ADR-001](adr/ADR-001-oasis-boundary.md);
- vendor `camel-oasis` ke dalam repo backend dan pin ke commit, jangan hanya ke versi PyPI, agar build dapat direproduksi.

### 3. Gemini 2.5 keluar dari GA sebelum atau sekitar masa lomba

`gemini-2.5-flash` dan `gemini-2.5-pro` berstatus GA-stable **sampai 16 Oktober 2026**. Seri Gemini 3 sudah tersedia: `gemini-3-flash-preview`, `gemini-3.1-flash-lite`, `gemini-3.1-pro-preview`.

Karena jadwal GEMASTIK berpotensi melewati Oktober 2026, memin ke 2.5 berarti menjadwalkan migrasi tepat di tengah masa kritis.

**Keputusan:** pakai `gemini-3.1-flash-lite` sebagai model default — stabil, runway panjang, biaya mirip flash-lite generasi sebelumnya. Model preview (`-preview` pada namanya) **dilarang** untuk jalur demo karena dapat berubah tanpa pemberitahuan.

Routing model per council:

| Council | Model | Alasan |
|---|---|---|
| Customer Persona | `gemini-3.1-flash-lite` | volume tinggi, output pendek dan terstruktur |
| Market Analyst | `gemini-3.1-flash-lite` | argumen pendek dengan evidence ID |
| Finance | `gemini-3.1-flash-lite` | tidak menghitung, hanya mengkritik |
| Report | model kelas pro | sintesis panjang, paling sensitif pada kualitas |

Simpan `model_id` persis pada run manifest. Alias provider dapat berpindah diam-diam; tanpa pencatatan, perbandingan antar-run kehilangan makna.

## Keputusan lain

### Tailwind v4, bukan v3

Tailwind v4 memindahkan konfigurasi dari JavaScript ke CSS melalui direktif `@theme`. Ini cocok dengan cara token didefinisikan di [UI system](13-ui-system-and-mock-plan.md): token ditulis sekali sebagai custom property dan langsung menjadi utility class.

```css
@import "tailwindcss";

@theme {
  --color-ink-900: #101413;
  --color-ink-500: #5C6663;
  --color-line:    #E4E7E6;
  --color-teal-700:#0E5A63;
  --color-amber-600:#D4610A;
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-serif:"Source Serif 4", Georgia, serif;
}
```

Tidak ada `tailwind.config.js` berisi palet. Satu sumber token.

### OCR: PaddleOCR sebagai primer

Struk UMKM Indonesia umumnya cetakan termal: kontras rendah, condong, kadang terlipat, dan berisi line item dalam kolom.

| Kandidat | Pertimbangan |
|---|---|
| **PaddleOCR + PP-StructureV3** | analisis layout bawaan untuk line item bertabel; akurasi kuat pada aksara Asia; berjalan di CPU | 
| Tesseract 5.x | paling ringan dan cepat pada scan bersih, tetapi lemah pada struktur tabel |
| Gemini vision | ekstraksi bagus, tetapi confidence per field tidak dapat diandalkan, padahal [data & scoring](05-data-evidence-and-scoring.md) mewajibkan confidence per field untuk layar review |

**Keputusan:** PaddleOCR primer. Tesseract boleh menjadi fallback ringan. Model vision **tidak** dipakai sebagai sumber angka final; bila kelak dipakai, hanya untuk membantu pencocokan nama produk, bukan untuk mengisi jumlah dan harga.

Catatan operasional: PaddleOCR menambah ukuran image container secara signifikan. Anggarkan disk dan waktu build di VM fakultas sejak awal.

### Uang dan angka

- Uang disimpan dan dikirim sebagai **integer rupiah**. Tidak ada `float` di jalur uang mana pun.
- Di Python gunakan `int` atau `Decimal`; jangan `float`.
- Di TypeScript uang adalah `number` integer dari API dan **hanya diformat**, tidak pernah dihitung.
- `Intl.NumberFormat('id-ID')` untuk tampilan.

### Testing

| Lapis | Alat |
|---|---|
| Backend unit/integration | pytest + pytest-asyncio |
| Golden finance/scoring | pytest dengan fixture JSON bersama frontend |
| Frontend unit/komponen | Vitest + Testing Library |
| E2E | Playwright |
| Aksesibilitas | axe pada Playwright + pemeriksaan manual keyboard |
| Lint/format | Ruff (Python), ESLint + Prettier (TS) |
| Type check | mypy/pyright (Python), `tsc --noEmit` (TS) |

## Yang tidak dipakai di MVP

Ditulis eksplisit agar tidak ada yang menambahkannya diam-diam:

- pgvector **belum** dipakai sampai retrieval benar-benar masuk roadmap; kolom boleh disiapkan, fitur belum;
- GraphRAG, knowledge graph, dan memory lintas run;
- integrasi POS/payment;
- native mobile;
- simulasi skala besar OASIS (ratusan ribu agent);
- Google Places sebagai sumber kompetitor sebelum review lisensi selesai.

## Jadwal verifikasi ulang

| Kapan | Yang diperiksa |
|---|---|
| Sebelum Sprint 0 dikunci | seluruh versi di tabel pin, dijalankan sekali di VM target |
| Awal September 2026 | status GA Gemini dan ketersediaan model |
| Sebelum feature freeze | audit dependency dan secret scanning |

Setiap perubahan pin dicatat sebagai baris baru di tabel dengan tanggal, bukan menimpa nilai lama.
