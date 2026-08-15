# Roadmap MVP

## Status implementasi per 16 Agustus 2026

Status ditulis berdasarkan artifact yang sudah ada, bukan persentase.

| Tahap | Artifact yang sudah ada | Artifact berikutnya |
|---|---|---|
| Sprint 0 | Contract API dan schema, CI frontend/backend, Docker Compose, spike empat profil OASIS terisolasi, hard limit, unique trace, deterministic finance tool, serta test dependency | Benchmark Gemini live berulang setelah API key tersedia; evidence source/license decision |
| Sprint 1 | Auth dan RBAC tenant, education gate, input snapshot, evidence contract, finance/scoring/report engine deterministik, analysis history/report API, UI education/analysis/report, dan Alembic `0006` | Expert review threshold serta content edukasi produksi |
| Sprint 2 | Celery worker terpisah, live SSE dengan replay, recovery lease, adapter OASIS live/fake/unavailable, empat council, behavioral archetype versioned, exposure trace, protokol round, typed artifact, manifest dan trace persistence, hard budget, fallback `partial`, serta UI progress dan simulasi | Benchmark Gemini live dan pembekuan ukuran cohort/round setelah API key tersedia; scenario comparison sebagai fitur Should |
| Sprint 3 | Product, transaksi manual, dashboard, gate tujuh hari, analytics dan insight deterministik | OCR upload/review/confirm, batch flow penuh, private object storage, PDF export, retention job |
| Sprint 4 | Unit, integration, contract, RBAC, finance/scoring golden test, dan E2E dasar | Calibration, usability, accessibility, security, load, backup/restore, ablation, dan release evidence |

Detail commit dan keputusan yang masih menunggu berada di [`../HANDOVER.md`](../HANDOVER.md).

## Delivery principle

Bangun satu vertical slice yang dapat didemonstrasikan lebih awal. OASIS adalah spike risiko pertama, bukan integrasi terakhir. Setiap sprint harus menghasilkan artifact yang dapat diuji dan tidak bergantung pada klaim “persentase selesai”.

## Sprint 0 — feasibility dan contracts (1 minggu)

### Deliverables

- Turunkan seluruh fixed scope proposal menjadi acceptance criteria dan backlog teknis.
- Definisikan taxonomy untuk restoran, warung, kafe, gerobak, katering, dan cloud kitchen serta hierarchy wilayah Jabodetabek.
- Evidence source/license spike.
- OASIS spike untuk keempat agent type: custom personality/profile, agent graph, tool/action call, interview, council reducer, dan trace extraction.
- OCR spike: preprocessing foto struk, text extraction, line-item parser, product matching, confidence, dan review draft.
- Gemini adapter spike melalui CAMEL pada versi yang dipin.
- Benchmark latency, token, cost, dan failure mode.
- OpenAPI draft, DB schema draft, UX low-fi flow.
- Golden finance cases dan scoring rule placeholder.

### Exit criteria

Satu script menghasilkan manifest, trace, structured ballots, deterministic finance result, dan final report dari empat agent type. Benchmark menentukan optimasi jumlah personality instance, concurrency, dan model routing tanpa menghapus agent type dari scope.

## Sprint 1 — deterministic skeleton (2 minggu)

### Backend

- Auth/session, user dan business profile.
- PostgreSQL migration dan repository isolation.
- Education content/version/progress.
- Analysis create/status state machine.
- Finance engine + test.
- Initial scoring engine + versioning.

### Frontend

- Landing, auth, dashboard shell.
- Business profile wizard.
- Education module + knowledge check.
- Analysis form dan validation.

### Exit criteria

Deterministic engines dan seluruh kontrak artifact siap dipanggil oleh OASIS agent tools; fixture path tersedia untuk unit/integration testing.

## Sprint 2 — OASIS vertical slice (2 minggu)

### Backend

- Redis/Celery worker dan SSE status.
- Evidence snapshot builder.
- Persona cohort builder.
- OASIS adapter, unique trace, timeout, budget, cleanup.
- Trace extractor dan simulation metrics.
- Report composer + red-team/schema/citation validator.

### Frontend

- Live stage status.
- Report score + confidence + provenance + limitations.
- Scenario comparison.

### Exit criteria

Satu representative test case menyelesaikan full four-agent run dan fallback partial run; pipeline data tetap menerima hierarchy wilayah serta taxonomy F&B Jabodetabek yang ditetapkan proposal.

## Sprint 3 — transaction loop dan export (2 minggu)

### Backend

- Product dan transaction CRUD.
- Upload session foto struk dan private object storage.
- OCR preprocessing, text/line-item extraction, product matching, field confidence, dan correction draft.
- Confirm/import transaction secara idempotent dan atomik.
- Aggregation dan rule-based insight.
- PDF export async.
- Audit event dan retention job.

### Frontend

- Product setup.
- Input transaksi manual, batch, dan foto struk dengan layar review hasil OCR.
- Transaction dashboard.
- Export UI.

### Exit criteria

Dua critical journey E2E lulus, termasuk `upload foto struk -> OCR -> review -> commit -> analytics`.

## Sprint 4 — validation, hardening, demo (1–2 minggu)

- Wawancara dan expert review rule/weight.
- Human-vs-synthetic calibration pilot.
- SUS/usability test.
- OASIS ablation demo.
- Security, accessibility, browser, load, backup/restore tests.
- Fix P0/P1, freeze versions, seed golden demo.
- Proposal evidence register dan screenshot final.

## Must/Should/Later

| Must | Should jika waktu ada | Later |
|---|---|---|
| Auth dan tenant isolation | Compare dua skenario | POS/payment integration |
| Education relevan | Admin quality overview | RAG/GraphRAG |
| Async Market Analysis | Optimasi model routing | Native mobile |
| Finance/scoring deterministic | Cached replay untuk evaluator | National coverage |
| Empat OASIS agent type + personality councils + trace | Report feedback | Large-scale simulation |
| Score + confidence + provenance + PDF exports | | Forecasting lanjutan |
| Transaction manual, batch, foto struk/OCR + insight dasar | | Marketplace integration |
| Fallback dan disclaimer | | |

## Workstream ownership

| Workstream | Output |
|---|---|
| Product/research | Interview, persona calibration, evidence register, content review |
| Frontend | Journey, visualization, accessibility, error/loading state |
| Backend | API, persistence, jobs, deterministic engines, export |
| AI/simulation | Cohort, prompt, OASIS adapter, trace, evaluation |
| DevOps/quality | CI, deployment, secrets, monitoring, backup, release evidence |

Satu orang dapat memegang beberapa workstream, tetapi owner dan reviewer harus tertulis.

## Decision deadlines

- Akhir Sprint 0: versi dependency OASIS/CAMEL, model routing, concurrency, dan token budget dikunci.
- Tengah Sprint 1: evidence provider dan supported geography.
- Akhir Sprint 1: scoring v0 input availability.
- Akhir Sprint 2: four-agent contract dan trace schema dibekukan.
- Awal Sprint 4: feature freeze; hanya validation dan bug fix.

## Demo narrative

1. Tunjukkan user memilih konsep dan evidence area.
2. Jelaskan persona cohort, bukan hanya empat ikon agent.
3. Perlihatkan satu trace interaksi dan controlled price intervention.
4. Tunjukkan finance formula menghasilkan angka tanpa LLM.
5. Tunjukkan score dan confidence berbeda.
6. Matikan/simulasikan error provider dan perlihatkan partial report.
7. Masukkan transaksi dan tunjukkan bagaimana data nyata menutup feedback loop.

## Definition of done per feature

- Acceptance criteria tertulis dan lulus.
- Unit/integration test sesuai risiko.
- Loading, empty, error, unauthorized, dan retry state ditangani.
- Accessibility keyboard/label/contrast dicek.
- Observability dan audit event tersedia.
- Dokumentasi API/schema diperbarui.
- Tidak ada secret atau user artifact di repo.
- Known limitation terlihat oleh pengguna bila memengaruhi keputusan.
