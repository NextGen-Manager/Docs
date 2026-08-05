# Kontrak API MVP

## Prinsip

- Prefix `/v1`.
- OpenAPI dari FastAPI adalah source of truth dan TypeScript client digenerate.
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
| `POST` | `/v1/auth/logout` | Revoke session |
| `GET` | `/v1/me` | Profil user |
| `PUT` | `/v1/business-profile` | Membuat/mengubah profil usaha |
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
| `POST` | `/v1/receipt-imports` | Membuat upload session foto struk |
| `POST` | `/v1/receipt-imports/{id}/complete-upload` | Konfirmasi upload dan antrekan OCR |
| `GET` | `/v1/receipt-imports/{id}` | Status serta draft hasil ekstraksi |
| `PATCH` | `/v1/receipt-imports/{id}/draft` | Koreksi field hasil OCR |
| `POST` | `/v1/receipt-imports/{id}/confirm` | Commit draft sebagai transaksi |
| `GET` | `/v1/transactions` | List dengan filter tanggal |
| `GET` | `/v1/transaction-analytics` | Agregasi dan insight |
| `POST` | `/v1/transaction-exports` | Membuat PDF ringkasan transaksi async |

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

## Report shape minimum

```json
{
  "analysis_id": "uuid",
  "report_version": "report-v1",
  "status": "completed",
  "readiness": {
    "score": 72,
    "rule_version": "lrs-v0.1-unvalidated",
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
  "occurred_at": "2026-08-05T05:10:00Z",
  "items": [
    {"product_id": "uuid", "quantity": 2, "unit_price_idr": 18000}
  ],
  "channel": "takeaway",
  "client_reference": "device-local-id-123"
}
```

Backend menghitung total. `client_reference` + tenant scope dapat mencegah duplicate saat jaringan tidak stabil.

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
- Signed export URL berumur pendek.
- Admin endpoint terpisah, audited, dan tidak dapat membaca raw transaction tanpa kebutuhan/otorisasi.
- Refresh token rotation dan revocation lebih aman daripada JWT access token berumur panjang.
