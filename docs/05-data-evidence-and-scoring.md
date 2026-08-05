# Data, Financial Engine, dan Scoring

## Prinsip evidence

Setiap data point harus dibungkus sebagai evidence record:

```json
{
  "metric": "competitor_count",
  "value": 18,
  "unit": "places",
  "geography": {"type": "radius", "meters": 1500, "center_id": "jabodetabek-area-id"},
  "category_mapping_version": "fnb-taxonomy-v1",
  "source": "openstreetmap",
  "source_url": "https://www.openstreetmap.org/",
  "observed_at": "2026-08-01T00:00:00Z",
  "retrieved_at": "2026-08-05T00:00:00Z",
  "quality": {"coverage": "unknown", "freshness": "recent", "confidence": 0.55},
  "limitations": ["POI completeness is not guaranteed"]
}
```

Angka tanpa provenance tidak boleh masuk report final sebagai fakta.

## Source strategy MVP

| Kebutuhan | Kandidat | Keputusan MVP |
|---|---|---|
| Batas wilayah | Data geospasial pemerintah/OSM yang lisensinya jelas | Curated dan versioned |
| Populasi/demografi | BPS Web API/publikasi daerah | Gunakan level agregasi yang benar-benar tersedia |
| Competitor POI | OSM/Overpass atau provider berlisensi | Versioned ingestion untuk Jabodetabek dengan coverage dan freshness per area |
| Harga pasar | Observasi manual terstruktur, wawancara, atau provider berlisensi | Jangan meminta LLM mengarang rata-rata harga |
| Traffic | Data resmi/partner bila tersedia | Jika tidak ada, gunakan proxy berlabel atau keluarkan dari score |
| Perizinan | OSS/BKPM, BPOM, BPJPH, pemerintah daerah | Konten dikurasi dan punya `reviewed_at` |
| Transaksi | Input manual, batch, dan hasil foto struk yang dikonfirmasi pengguna | Privat, tenant-scoped, bukan training data default |
| Foto struk | Upload pengguna + OCR pipeline | Object privat; retention, checksum, MIME validation, dan field confidence |

Google Places hanya boleh dipakai setelah review terms, attribution, retention, dan display. Kebijakan resminya membatasi prefetch/cache/storage di luar pengecualian. Jangan scrape Google Maps atau membuat database kompetitor permanen dari Places content tanpa dasar lisensi.

Public Overpass adalah shared service. Untuk MVP gunakan ingestion/cache beratribusi dan patuh lisensi; deployment stabil memakai provider atau self-hosted extract dengan rate limiting dan refresh schedule untuk cakupan Jabodetabek.

## Data quality dimensions

- **Coverage** — area/category tercakup atau tidak diketahui.
- **Freshness** — umur data relatif terhadap kebutuhan.
- **Granularity** — nasional, kota, kecamatan, kelurahan, atau radius.
- **Consistency** — konflik dengan source lain.
- **Sample sufficiency** — jumlah observasi harga/persona/transaksi.
- **Method fitness** — apakah metric benar-benar mengukur konstruk yang dimaksud.

Quality menghasilkan `Evidence Confidence` terpisah dari readiness.

## Financial input minimum

| Input | Unit |
|---|---|
| Average selling price | IDR/unit |
| Variable cost/HPP | IDR/unit |
| Monthly fixed cost | IDR/month |
| Initial investment | IDR |
| Expected daily volume range | unit/day |
| Operating days | day/month |
| Capacity | unit/day |

Jika HPP atau fixed cost tidak ada, BEP tidak boleh tampil sebagai angka presisi. Tampilkan checklist data kurang atau range dengan asumsi eksplisit.

## Formula otoritatif

```text
contribution_margin_per_unit = selling_price - variable_cost_per_unit
contribution_margin_ratio = contribution_margin_per_unit / selling_price
bep_units_month = fixed_cost_month / contribution_margin_per_unit
bep_revenue_month = fixed_cost_month / contribution_margin_ratio
monthly_revenue = volume_day * operating_days * selling_price
monthly_operating_profit =
  volume_day * operating_days * contribution_margin_per_unit - fixed_cost_month
payback_months = initial_investment / monthly_operating_profit
```

Rules:

- Validasi seluruh nilai non-negatif dan currency sama.
- Jika contribution margin `<= 0`, BEP/payback tidak terdefinisi dan harus diberi warning.
- Jika monthly operating profit `<= 0`, payback tidak terdefinisi.
- Pajak, depresiasi, owner salary, financing, spoilage, platform fee, dan promo harus disebut included/excluded.
- Gunakan integer minor unit/`Decimal`, bukan floating point untuk uang.

## Finance scenarios

Conservative/base/optimistic memilih nilai dari range input atau scenario assumptions versioned. Jangan membuat persentase arbitrary di prompt. Contoh:

```json
{
  "volume_day": {"conservative": 25, "base": 40, "optimistic": 55},
  "variable_cost": {"conservative": 12500, "base": 11500, "optimistic": 10800},
  "source": "user_estimate_and_supplier_quotes",
  "assumption_version": "finance-scenario-v1"
}
```

## Launch Readiness Score v0

Bobot proposal awal dipertahankan sebagai draft, bukan fakta tervalidasi:

```text
LRS = 0.30 * market_saturation
    + 0.25 * demand_potential
    + 0.25 * price_positioning
    + 0.20 * operational_readiness
```

Setiap dimension score berada pada 0–100 dan hanya berasal dari rule versioned.

### Market saturation

Candidate inputs: competitor density, same-category share, recent entry/closure jika tersedia, dan catchment definition. Jangan memakai raw count tanpa luas/radius dan category normalization.

### Demand potential

Candidate inputs: population/worker proxy, relevant occasion, accessibility/traffic proxy, dan synthetic persona signal. OASIS signal dibatasi sebagai satu feature berconfidence rendah sampai calibration selesai.

### Price positioning

Candidate inputs: price percentile terhadap observed comparable products, contribution margin viability, dan synthetic acceptable-price band. Missing market price harus menurunkan confidence, bukan diisi LLM.

### Operational readiness

Candidate inputs: kelengkapan biaya, positive contribution margin, capacity vs BEP volume, runway, legal checklist progress, supplier readiness, dan location readiness. Threshold `BEP <= 3 bulan` tidak digunakan sampai expert validation.

## Rule representation

```yaml
rule_set: lrs-v0.1-unvalidated
dimension: price_positioning
rules:
  - id: PP-001
    when: planned_price_percentile >= 20 and planned_price_percentile <= 80
    points: 60
    rationale: Within observed comparable range
    evidence_required:
      - comparable_price_sample_size
      - comparable_price_observed_at
    validation_status: hypothesis
```

Setiap perubahan bobot/threshold membuat versi baru. Report lama tetap menunjuk versi lama.

## Evidence Confidence

Draft formula:

```text
confidence = weighted_mean(
  source_quality,
  freshness,
  geographic_fit,
  sample_sufficiency,
  cross_source_consistency
)
```

Gunakan label yang mudah dipahami:

| Nilai | Label | Perilaku UI |
|---|---|---|
| 0.75–1.00 | Tinggi | Hasil dapat dipakai untuk shortlist, tetap perlu cek lapangan |
| 0.50–0.74 | Sedang | Tampilkan missing evidence dan sensitivity |
| <0.50 | Rendah | Hindari CTA “lanjut”; arahkan pengumpulan data |

Cutoff di atas juga draft dan perlu diuji. Confidence tidak menaikkan/menurunkan score diam-diam; keduanya tampil berdampingan.

## Transaction analytics

MVP memakai query/rule deterministic:

- gross sales per hari/minggu;
- quantity dan revenue per produk;
- top/bottom product dengan minimum exposure;
- moving average sederhana jika jumlah hari cukup;
- no-sale streak berdasarkan hari operasi;
- data completeness dan hari tercatat.

Hindari rekomendasi “hapus produk” hanya karena penjualan rendah. Pertimbangkan availability, margin, jumlah hari, dan apakah produk baru. Insight harus menyebut observation window.

## Data model foto struk

Pisahkan artifact upload, hasil OCR, draft koreksi, dan transaksi final:

```text
receipt_import
  1 -> 1 receipt_object
  1 -> N ocr_extraction_attempt
  1 -> 1 receipt_draft
  1 -> N receipt_draft_item
  0..1 -> 1 confirmed_transaction
```

Field teknis minimum:

- `receipt_import`: owner, status, checksum, MIME, size, timestamps, failure code;
- `receipt_object`: private object key, encryption/retention metadata;
- `ocr_extraction_attempt`: engine/model version, preprocessing version, raw-text object key, duration;
- `receipt_draft_item`: raw text, normalized name, matched product, quantity, unit price, confidence;
- `confirmed_transaction`: immutable reference ke import asal dan siapa yang mengonfirmasi.

Raw OCR text tidak langsung masuk analytics. Hanya transaksi berstatus confirmed/committed yang dihitung agar kesalahan ekstraksi tidak merusak dashboard.
