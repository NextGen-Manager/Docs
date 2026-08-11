# ADR-003: Mengubah Bobot Launch Readiness Score

- Status: Accepted untuk baseline MVP
- Tanggal: 2026-08-11
- Owners: Tim SimuMarket AI

## Context

`lrs-v0.1-unvalidated` menggunakan bobot 30% untuk *market saturation*, 25% untuk *demand potential*, 25% untuk *price positioning*, dan 20% untuk *operational readiness*. Product owner pada 11 Agustus 2026 menetapkan perubahan bobot untuk lebih menekankan kesiapan operasional usaha.

Perubahan hanya menyentuh bobot empat dimensi. Definisi dimensi, aturan pembentuk *dimension score*, rentang interpretasi, serta batas antara OASIS dan deterministic Scoring Engine tidak berubah. Bukti validasi pakar belum menjadi artifact di repository, sehingga rule set baru tetap berstatus `unvalidated`.

## Decision

Buat rule set baru `lrs-v0.2-unvalidated` dengan formula:

```text
LRS = 0.20 * market_saturation
    + 0.25 * demand_potential
    + 0.15 * price_positioning
    + 0.40 * operational_readiness
```

Jumlah bobot tetap 100%. Scoring Engine menghitung agregat secara deterministik dari *dimension score* sebelum pembulatan tampilan. Laporan yang sudah dibuat dengan `lrs-v0.1-unvalidated` tidak dihitung ulang dan tetap menunjuk rule version lama.

Rentang interpretasi tetap:

- 80–100: sangat layak;
- 65–79: layak dengan mitigasi;
- 50–64: perlu evaluasi ulang;
- di bawah 50: tidak disarankan pada kondisi yang diuji.

## Consequences

### Positive

- Kesiapan modal, lokasi, dan feasibility finansial dasar mendapat pengaruh terbesar pada skor akhir.
- Perubahan dapat diaudit karena memakai rule version baru dan tidak menimpa laporan historis.
- Demand potential tetap memiliki bobot yang sama dengan baseline sebelumnya.

### Negative

- Skor skenario yang sama dapat berubah ketika dijalankan dengan rule version baru.
- Pengaruh sinyal saturasi pasar dan posisi harga terhadap skor akhir berkurang.
- Bobot masih merupakan hipotesis sampai expert review dan calibration menghasilkan artifact yang dapat ditelusuri.

## Alternatives rejected

### Menimpa `lrs-v0.1-unvalidated`

Ditolak karena laporan lama akan kehilangan provenance dan tidak lagi dapat direproduksi dengan rule version yang tercantum.

### Mengubah bobot tanpa memperbarui fixture frontend

Ditolak karena label bobot, skor komposit, dan rule version pada demo akan saling bertentangan.

### Mengubah rentang interpretasi bersamaan dengan bobot

Ditolak karena product owner hanya meminta perubahan bobot. Ambang interpretasi memerlukan keputusan dan validasi terpisah.

## Validation

Keputusan dianggap terimplementasi bila:

- bobot tepat berjumlah 100%;
- golden test Scoring Engine mengunci formula `lrs-v0.2-unvalidated`;
- fixture laporan frontend menampilkan bobot dan rule version yang sama;
- laporan historis `lrs-v0.1-unvalidated` tidak berubah;
- partial report menyebut bobot dimensi yang gagal sesuai rule version run tersebut.

## References

- [Data, financial engine, dan scoring](../05-data-evidence-and-scoring.md)
- [Strategi testing teknis](../08-testing-and-evaluation.md)
- [ADR-001: deterministic tool boundary](ADR-001-oasis-boundary.md)
