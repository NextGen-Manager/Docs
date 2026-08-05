# Strategi Testing dan Evaluasi

## Quality pyramid

### Unit tests

- Seluruh formula finance dengan normal, boundary, zero, dan invalid cases.
- Setiap scoring rule dan version migration.
- Evidence confidence calculation.
- Transaction aggregation dan insight rules.
- Input/schema validation, category mapping, dan money rounding.

### Integration tests

- FastAPI + PostgreSQL repository dengan tenant isolation.
- Celery + Redis state transition, retry, timeout, dan idempotency.
- OASIS adapter memakai fake/model stub untuk CI.
- Receipt preprocessing, OCR adapter, line-item parser, confidence threshold, dan product matcher memakai fixture foto sintetis/berizin.
- PDF generation dari golden report.
- Evidence provider adapter dengan recorded fixtures yang legal disimpan.

### Contract tests

- OpenAPI backward compatibility.
- Generated TypeScript client compile.
- SSE event schema.
- Provider model response schema dan fallback.

### End-to-end tests

- Register -> education -> create analysis -> progress -> report -> export.
- Setup product -> input transaction -> dashboard insight -> export.
- Upload foto struk -> OCR -> koreksi draft -> confirm -> transaction analytics.
- OASIS timeout -> partial report.
- Missing evidence -> low confidence warning.

## Golden financial cases

Minimal case berikut harus disepakati manual dan dikunci:

```text
selling price       = 20,000 IDR
variable cost       = 12,000 IDR
fixed cost/month    = 4,800,000 IDR
contribution margin = 8,000 IDR/unit
BEP units/month     = 600 unit
BEP revenue/month   = 12,000,000 IDR
```

Test juga margin nol/negatif, input besar, Decimal rounding, dan scenario dengan profit negatif sehingga payback tidak terdefinisi.

## OASIS evaluation

### Adapter correctness

- Environment/trace path unik per run.
- `INTERVIEW` tidak tersedia sebagai autonomous action.
- Action allowlist benar.
- Run ditutup pada success/failure.
- Trace extractor idempotent.
- Budget/timeout benar-benar menghentikan run.

### Stability

Jalankan concept card yang sama minimal beberapa kali. Ukur variation pada synthetic purchase share, objection ranking, dan acceptable-price band. Tampilkan variance; jangan memilih satu run yang paling menarik.

### Calibration dengan manusia

Bandingkan ranking konsep, top objection, dan direction of price sensitivity dengan respons wawancara/survei manusia. Target awal bukan menyatakan equivalence, tetapi menemukan bias dan batas penggunaan.

### Ablation yang penting untuk juri

Bandingkan:

1. single LLM answer;
2. independent persona panel tanpa interaksi;
3. OASIS panel dengan interaksi;
4. hybrid final report dengan deterministic engine.

Nilai structure completeness, contradiction rate, evidence citation, run variance, latency, dan cost. Ini menunjukkan kontribusi OASIS secara empiris, bukan hanya pada diagram.

## OCR receipt evaluation

### Dataset test

Sediakan fixture yang mencakup struk thermal jelas/pudar, perspektif miring, bayangan, resolusi rendah, beberapa item, diskon, subtotal, pajak, pembulatan, dan format angka Indonesia. Jangan memakai foto struk pengguna sebagai fixture publik.

### Metrics

- character/word error rate untuk raw OCR;
- field exact match untuk tanggal dan total;
- precision/recall line-item segmentation;
- quantity dan price numeric accuracy;
- product-match top-1 accuracy;
- percentage draft yang dapat dikonfirmasi tanpa koreksi;
- processing latency dan failure rate.

### Mandatory cases

- MIME extension palsu ditolak;
- file terlalu besar/rusak ditolak dengan error aman;
- total tidak sama dengan jumlah item memunculkan warning;
- confidence rendah memaksa review;
- confirm ganda tetap menghasilkan satu transaksi;
- transaksi tidak masuk analytics sebelum confirmed;
- object lintas tenant tidak dapat diakses.

## AI/report quality rubric

| Dimension | Cara ukur |
|---|---|
| Groundedness | Persentase factual claims yang menunjuk artifact/evidence |
| Numeric fidelity | Angka report identik dengan engine output |
| Actionability | Rekomendasi memiliki action, reason, dan expected signal |
| Limitation honesty | Missing data dan synthetic nature disebut |
| Consistency | Tidak ada konflik antarseksi/schema |
| Bahasa | Jelas untuk user non-teknis, tanpa jargon berlebih |

Block release bila numeric fidelity <100% pada golden set.

## Usability testing

### Task

- Menyiapkan satu skenario.
- Memahami perbedaan score dan confidence.
- Menemukan dimensi risiko utama.
- Membandingkan dua skenario.
- Memasukkan transaksi umum di bawah 30 detik.
- Menjelaskan kembali disclaimer dengan kata sendiri.

### Measurement

- task completion rate;
- time on task;
- error dan backtrack;
- comprehension question;
- SUS setelah seluruh task;
- qualitative issue severity.

Target SUS `>=70` dipakai sebagai target tim, bukan klaim keberhasilan sebelum test. Laporkan jumlah partisipan, karakteristik, skenario, median, range, dan limitation.

## Performance targets draft

| Path | Target MVP |
|---|---|
| Normal API read p95 | <500 ms di luar network eksternal |
| Transaction create p95 | <800 ms |
| Analysis accepted | <2 s sampai job ID diberikan |
| Full analysis | target <60 s; hard timeout ditentukan spike |
| Status update | minimal setiap perubahan stage |
| Frontend blank/crash | 0 pada E2E critical path |

Target simulasi harus direvisi dari hasil spike dengan provider dan VM nyata.

## Release gates

- Seluruh P0/P1 deterministic test lulus.
- Tidak ada cross-tenant access.
- Report number reconciliation 100%.
- Fallback partial report lulus.
- Tidak ada critical/high security finding terbuka.
- Demo dataset memiliki provenance dan license note.
- Known limitations tampil di UI dan PDF.
- Cost per demo run berada di bawah budget yang disetujui tim.
