# Kontrak API MVP

## Prinsip

- Prefix `/v1`.
- OpenAPI dari FastAPI adalah source of truth. Schema Zod frontend ditranskripsi dari kontrak ini dan diperiksa lewat contract test sampai generator client dipasang.
- Uang dikirim sebagai integer IDR, bukan float.
- Timestamp ISO 8601 UTC.
- Resource ID berupa UUID.
- POST yang dapat diulang menerima `Idempotency-Key`.
- Error memakai shape yang stabil dan user-safe.

## Endpoint map

### Identity dan profile

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/v1/auth/register` | Registrasi |
| `POST` | `/v1/auth/login` | Membuat session/token |
| `POST` | `/v1/auth/refresh` | Rotasi refresh token dan menerbitkan session baru |
| `POST` | `/v1/auth/logout` | Revoke session |
| `GET` | `/v1/me` | Profil user |
| `GET/POST` | `/v1/businesses` | List/membuat usaha |
| `PUT` | `/v1/businesses/{business_id}` | Mengubah profil usaha, owner-only |
| `POST` | `/v1/businesses/{business_id}/invites` | Membuat kode kasir, owner-only |
| `GET` | `/v1/businesses/{business_id}/invites/{invite_id}` | Membaca status kode tanpa mengembalikan kode mentah, owner-only |
| `DELETE` | `/v1/businesses/{business_id}/invites/{invite_id}` | Mencabut kode kasir, owner-only |
| `POST` | `/v1/invites/redeem` | Menukar kode menjadi membership kasir |
| `DELETE` | `/v1/businesses/{business_id}/members/{user_id}` | Menghapus membership kasir, owner-only |
| `GET` | `/v1/dashboard` | Ringkasan aktivitas, modul, score terakhir, dan insight |

### Education

| Method | Path | Fungsi |
|---|---|---|
| `GET` | `/v1/education/modules` | Modul yang relevan |
| `GET` | `/v1/education/modules/{id}` | Content version tertentu |
| `POST` | `/v1/education/modules/{id}/complete` | Simpan progress/quiz |
| `GET` | `/v1/education/prerequisites` | Gate untuk skenario saat ini |

### Market analysis

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/v1/analyses` | Membuat async run |
| `GET` | `/v1/analyses` | Riwayat analysis user |
| `GET` | `/v1/analyses/{id}` | Metadata dan status |
| `GET` | `/v1/analyses/{id}/events` | SSE progress |
| `GET` | `/v1/analyses/{id}/report` | Structured report |
| `POST` | `/v1/analyses/compare` | Membandingkan dua completed run |
| `POST` | `/v1/analyses/{id}/exports` | Membuat PDF async |
| `GET` | `/v1/exports/{id}` | Status/signed download URL |

### Products dan transactions

| Method | Path | Fungsi |
|---|---|---|
| `GET/POST` | `/v1/products` | List/tambah produk |
| `PATCH` | `/v1/products/{id}` | Ubah produk |
| `POST` | `/v1/transactions` | Input satu transaksi |
| `POST` | `/v1/transactions/batch` | Batch manual/import terkontrol |
| `POST` | `/v1/receipt-imports?business_id={business_id}` | Membuat upload session foto struk |
| `POST` | `/v1/receipt-imports/{id}/complete-upload?business_id={business_id}` | Konfirmasi upload dan antrekan OCR |
| `GET` | `/v1/receipt-imports/{id}?business_id={business_id}` | Status serta draft hasil ekstraksi |
| `PATCH` | `/v1/receipt-imports/{id}/draft?business_id={business_id}` | Koreksi field hasil OCR |
| `POST` | `/v1/receipt-imports/{id}/confirm?business_id={business_id}` | Commit draft sebagai transaksi |
| `GET` | `/v1/transactions` | List dengan filter tanggal |
| `GET` | `/v1/transaction-analytics` | Agregasi dan insight |
| `POST` | `/v1/transaction-exports` | Membuat PDF ringkasan transaksi async |

## Session dan membership

Access token dan refresh token dikirim sebagai cookie `HttpOnly`, `SameSite=Lax`. Access token berlaku singkat. Refresh token disimpan server sebagai hash, dirotasi setiap kali `/v1/auth/refresh` berhasil, dan token lama tidak dapat dipakai kembali. Frontend tidak menyimpan token di `localStorage`.

Respons register, login, refresh, dan `GET /v1/me` memakai bentuk yang sama:

```json
{
  "user": {
    "id": "uuid",
    "email": "owner@example.com",
    "display_name": "Pemilik Usaha",
    "created_at": "2026-08-14T01:00:00Z"
  },
  "memberships": [
    {
      "business_id": "uuid",
      "business_name": "Kedai Contoh",
      "location_name": "Tebet, Jakarta Selatan",
      "role": "owner"
    }
  ]
}
```

Role melekat pada pasangan user-usaha, bukan pada user secara global. Nilainya `owner` atau `cashier`. Kode undangan terdiri dari delapan karakter, sekali pakai, berlaku tujuh hari, dan hanya hash-nya yang disimpan. Resource usaha lain selalu merespons `404`, termasuk ketika ID-nya valid, agar keberadaan tenant tidak bocor.

## Dashboard

`GET /v1/dashboard` tanpa `business_id` menghasilkan ringkasan komposit seluruh usaha yang dimiliki user. Parameter opsional `business_id` dipakai untuk dashboard kasir pada toko yang ditugaskan. Field `keadaan` ditentukan backend:

| Nilai | Makna |
|---|---|
| `belum_ada_data` | Owner belum memiliki usaha atau analisis |
| `sudah_menganalisis` | Analisis tersedia, tetapi belum ada data transaksi usaha berjalan |
| `usaha_berjalan_data_kurang` | Transaksi ada, tetapi belum mencapai gate tujuh hari berbeda |
| `usaha_berjalan_data_cukup` | Analitik transaksi sudah tersedia |
| `kasir_belum_mencatat` | Kasir belum mencatat transaksi hari ini |
| `kasir_sudah_mencatat` | Kasir sudah mencatat transaksi hari ini |

Response minimum:

```json
{
  "keadaan": "usaha_berjalan_data_kurang",
  "analisis_terakhir": null,
  "rencana_30_hari": {"total": 0, "selesai": 0, "berikutnya": []},
  "transaksi": {
    "hari_tercatat": 3,
    "ambang": 7,
    "hari_ini": {"jumlah": 4, "pendapatan_idr": 72000}
  },
  "insight_terbaru": null,
  "edukasi": {"total": 0, "selesai": 0},
  "riwayat_analisis": []
}
```

Nilai nol menyatakan hasil query yang sah. Field dari modul yang belum menghasilkan data memakai `null` atau list kosong, bukan angka fallback yang diciptakan frontend.

### Admin dan feedback

| Method | Path | Fungsi |
|---|---|---|
| `POST` | `/v1/feedback` | Feedback user terhadap report/fitur |
| `GET` | `/v1/admin/ai-runs` | Monitoring status, latency, cost, dan kualitas output AI |
| `GET` | `/v1/admin/feedback` | Monitoring feedback pengguna |
| `GET` | `/v1/admin/usage` | Agregasi penggunaan fitur |

## Create analysis

Request:

```json
{
  "business_type": "food_stall",
  "concept_name": "Rice Bowl Sambal",
  "location": {
    "area_id": "jabodetabek-area-id",
    "latitude": -6.2,
    "longitude": 106.8,
    "analysis_radius_m": 1500
  },
  "pricing": {
    "average_selling_price_idr": 18000,
    "variable_cost_per_unit_idr": 11000
  },
  "operations": {
    "initial_investment_idr": 15000000,
    "fixed_cost_month_idr": 5000000,
    "operating_days_month": 26,
    "capacity_units_day": 80,
    "volume_units_day": {"min": 25, "base": 40, "max": 55}
  },
  "channels": ["takeaway", "delivery"],
  "value_proposition": "Makan siang cepat dengan pilihan sambal"
}
```

Response `202 Accepted`:

```json
{
  "analysis_id": "8ff7d369-924a-4d6e-ac0e-4c94aa868d0a",
  "status": "queued",
  "created_at": "2026-08-05T08:00:00Z",
  "status_url": "/v1/analyses/8ff7d369-924a-4d6e-ac0e-4c94aa868d0a",
  "events_url": "/v1/analyses/8ff7d369-924a-4d6e-ac0e-4c94aa868d0a/events"
}
```

## Analysis status

```json
{
  "analysis_id": "8ff7d369-924a-4d6e-ac0e-4c94aa868d0a",
  "status": "simulating",
  "progress": {
    "completed_stages": ["collecting_evidence", "building_context"],
    "current_stage": "simulating",
    "message": "Panel persona sedang mengevaluasi skenario",
    "percent": 45
  },
  "warnings": []
}
```

Persentase berasal dari weighted stage completion, bukan estimasi palsu per token.

## Analysis progress event

`GET /v1/analyses/{id}/events` mengirim event SSE bernama `status`. Setiap transisi disimpan ke PostgreSQL sebelum dipublikasikan. Redis hanya transport, bukan system of record. Browser dapat mengirim header `Last-Event-ID`; server melanjutkan dari sequence berikutnya tanpa mengulang event lama.

```text
id: 4
event: status
data: {"schema_version":"analysis-event-v1","event_id":"4","analysis_id":"8ff7d369-924a-4d6e-ac0e-4c94aa868d0a","status":"simulating","current_stage":"simulating","completed_stages":["queued","collecting_evidence","building_context"],"skipped_stages":[],"percent":45,"message":"Panel persona sedang mengevaluasi skenario","warnings":[],"failure_code":null,"correlation_id":"c2f50d3c-d97f-4c19-96bd-abd40d4dc6ef","occurred_at":"2026-08-15T08:01:20Z"}
```

`event_id` meningkat monotonik per analysis. `failure_code` bernilai `null` pada run normal dan membawa kode aman pada kegagalan terminal. Client tidak boleh menebak penyebab kegagalan dari urutan `warnings`. Jika SSE berulang kali terputus, frontend mengambil snapshot otoritatif melalui `GET /v1/analyses/{id}` setiap tiga detik. Snapshot polling tidak dibandingkan dengan `event_id` sintetis karena ia membaca state terbaru secara langsung.

## Report shape minimum

```json
{
  "analysis_id": "uuid",
  "report_version": "report-v1",
  "status": "completed",
  "readiness": {
    "score": 72,
    "rule_version": "lrs-v0.2-unvalidated",
    "interpretation": "layak_dengan_mitigasi",
    "dimensions": []
  },
  "evidence_confidence": {
    "score": 0.58,
    "label": "sedang",
    "missing": ["traffic observation"]
  },
  "market": {},
  "synthetic_simulation": {
    "status": "experimental",
    "cohort_size": 16,
    "metrics": {},
    "limitations": []
  },
  "finance": {
    "currency": "IDR",
    "scenarios": []
  },
  "recommendations": [],
  "evidence": [],
  "disclaimer": "Hasil adalah alat bantu keputusan, bukan jaminan keberhasilan usaha."
}
```

## Transaction request

```json
{
  "business_id": "uuid",
  "occurred_at": "2026-08-05T05:10:00Z",
  "items": [
    {"product_id": "uuid", "quantity": 2, "unit_price_idr": 18000}
  ],
  "channel": "takeaway",
  "client_reference": "device-local-id-123"
}
```

Backend menghitung `line_total_idr` dan `gross_total_idr`; frontend tidak menjumlahkannya. Kombinasi `(business_id, client_reference)` unik ketika reference tidak null sehingga retry jaringan mengembalikan transaksi yang sama tanpa pencatatan ganda. Query list produk, transaksi, dan analitik wajib membawa `business_id`.

Kasir dapat membaca nama produk aktif dan `selling_price_idr`, lalu membuat transaksi. Response produk kasir tidak memuat `hpp_idr` atau `margin_idr`. Pengelolaan produk, riwayat transaksi, serta `/v1/transaction-analytics` owner-only dan merespons `404` untuk kasir.

## Transaction analytics

`GET /v1/transaction-analytics?business_id={uuid}` selalu mengembalikan status gate. Analitik baru `available` setelah transaksi mencakup tujuh tanggal lokal berbeda pada zona `Asia/Jakarta`.

```json
{
  "status": "available",
  "business_id": "uuid",
  "days_recorded": 7,
  "threshold_days": 7,
  "observation_window": {
    "start": "2026-08-08",
    "end": "2026-08-14",
    "timezone": "Asia/Jakarta"
  },
  "daily_sales": [],
  "product_sales": [],
  "top_product": null,
  "bottom_product": null,
  "hourly_sales": [],
  "insights": [],
  "limitations": []
}
```

Setiap angka agregat dihitung engine deterministik. Insight membawa `rule_version` dan `observation_window`. Ketika status `collecting`, list analitik kosong dan `observation_window` null; sistem tidak menampilkan pola sementara sebagai fakta.

## Foto struk dan OCR

Create upload session:

```json
POST /v1/receipt-imports
{
  "file_name": "struk-2026-08-05.jpg",
  "content_type": "image/jpeg",
  "size_bytes": 824331,
  "sha256": "hex-encoded-sha256"
}
```

Response:

```json
{
  "receipt_import_id": "uuid",
  "status": "uploading",
  "upload": {
    "method": "PUT",
    "url": "short-lived-signed-url",
    "expires_at": "2026-08-05T08:10:00Z"
  }
}
```

Draft setelah OCR:

```json
{
  "receipt_import_id": "uuid",
  "status": "ready_for_review",
  "draft": {
    "merchant_name": {"value": "Warung Contoh", "confidence": 0.94},
    "occurred_at": {"value": "2026-08-05T05:10:00Z", "confidence": 0.81},
    "items": [
      {
        "raw_name": "RICE BOWL AYM",
        "matched_product_id": "uuid-or-null",
        "quantity": 2,
        "unit_price_idr": 18000,
        "confidence": 0.76
      }
    ],
    "total_idr": {"value": 36000, "confidence": 0.92}
  },
  "warnings": ["Nama produk perlu dikonfirmasi"]
}
```

Aturan commit:

- OCR tidak menulis transaksi final secara otomatis.
- Pengguna dapat memperbaiki seluruh field dan mencocokkan item ke master produk.
- Backend memeriksa `sum(quantity * unit_price)` terhadap total; mismatch memerlukan konfirmasi eksplisit.
- Endpoint `confirm` bersifat idempotent dan membuat transaksi beserta referensi `receipt_import_id` dalam satu database transaction.
- Image disimpan privat dengan retention policy; URL object tidak pernah dikirim sebagai URL publik permanen.

## Error shape

```json
{
  "error": {
    "code": "ANALYSIS_INPUT_INCOMPLETE",
    "message": "Data biaya variabel diperlukan untuk menghitung BEP.",
    "fields": [{"path": "pricing.variable_cost_per_unit_idr", "reason": "required"}],
    "correlation_id": "uuid",
    "retryable": false
  }
}
```

Jangan mengirim stack trace, prompt, provider response mentah, atau detail internal ke client.

## Authorization

- Semua resource user di-scope oleh authenticated user/tenant di repository query, bukan hanya UI.
- Owner dan kasir divalidasi ulang pada service/repository. Menyembunyikan menu bukan kontrol otorisasi.
- Signed export URL berumur pendek.
- Admin endpoint terpisah, audited, dan tidak dapat membaca raw transaction tanpa kebutuhan/otorisasi.
- Refresh token rotation dan revocation lebih aman daripada JWT access token berumur panjang.
