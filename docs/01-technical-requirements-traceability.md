# Technical Requirements Traceability

Dokumen ini mengunci requirement proposal sebagai source of truth. Dokumentasi arsitektur dan implementasi tidak boleh memindahkan, menghapus, atau menurunkan prioritas requirement tanpa instruksi eksplisit dari product owner.

## Fixed technology baseline

| Layer | Fixed technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11, Pydantic |
| AI engine | OASIS/CAMEL-AI, LangChain, empat agent inti |
| LLM | Google Gemini dengan multi-vendor adapter |
| Database | PostgreSQL + pgvector |
| Cache/queue | Redis + Celery |
| Deployment | VM Pacil/server fakultas |
| Design | Figma |
| UX measurement | System Usability Scale, target SUS >=70 |

## Functional traceability

| ID | Priority | Fixed requirement | Technical owner | API/UI/Test anchor |
|---|---|---|---|---|
| F-01 | Must | Register, login, logout, authentication | Identity | `/v1/auth/*`; auth integration/E2E |
| F-02 | Must | Dashboard aktivitas, modul, dan history | Dashboard | `/v1/me`, analysis/transaction summaries |
| F-03 | Must | Pilih jenis F&B dan lokasi Jabodetabek | Profile + Analysis | business taxonomy dan location hierarchy |
| F-04 | Must | Analisis kepadatan kompetitor | Evidence + Market Analyst | evidence snapshot dan MarketAssessment |
| F-05 | Must | Estimasi harga pasar dan segmen permintaan | Evidence + Market/Customer Agent | price evidence dan CustomerSimulationResult |
| F-06 | Must | Launch Readiness Score 0–100 dan breakdown | Scoring Engine | versioned rules + dimension result |
| F-07 | Must | Report: score, kompetitor, BEP, rekomendasi | Four-agent pipeline | `/v1/analyses/{id}/report` |
| F-08 | Must | Edukasi sesuai jenis usaha | Education | versioned content dan recommendation mapping |
| F-09 | Must | Edukasi relevan wajib selesai sebelum analysis | Education gate | prerequisite check pada create analysis |
| F-10 | Must | Input transaksi nama produk, jumlah, harga | Transaction | `/v1/transactions`, batch endpoint |
| F-10A | Must | Input transaksi melalui foto struk | Receipt OCR | `/v1/receipt-imports/*`, review dan confirm |
| F-11 | Must | Produk terlaris/terendah dan tren setelah 7 hari | Analytics | deterministic aggregate dengan observation window |
| F-12 | Must | Insight dan rekomendasi transaksi | Insight Engine | rule-based insight output |
| F-13 | Must | Download Market Analysis dan transaksi sebagai PDF | Export | `/v1/analyses/{id}/exports` dan transaction export |
| F-14 | Should | Bandingkan dua lokasi/jenis usaha side-by-side | Comparison | `/v1/analyses/compare` |
| F-15 | Should | Admin memantau output AI, feedback, dan usage | Admin/Observability | audited admin endpoints/dashboard |
| F-16 | Must | Disclaimer pada setiap hasil analysis | Report + Frontend | schema-required disclaimer + UI/E2E assertion |

## Four-agent traceability

| Fixed agent type | Personality council | Required input | Required output | Deterministic boundary |
|---|---|---|---|---|
| Market Analyst | Opportunity Scout, Competition Skeptic, Evidence Auditor | User context, competitor/location evidence | `MarketAssessment` | Evidence query/aggregation tools |
| Customer Persona | Budget, convenience, quality, social/family variants | Concept stimulus, price, location context, MarketAssessment | `CustomerSimulationResult` | Cohort builder dan metric reducer |
| Finance | Conservative, Base, Optimistic, Assumption Auditor | Capital, price, cost, capacity, customer/market artifacts | `FinanceScenarioResult` | BEP, margin, revenue, payback calculator |
| Report | Synthesizer, Red-team, Evidence Editor | Semua typed artifacts + ScoreResult | `MarketAnalysisReport` | Schema, citation, arithmetic validators |

Keempat type dijalankan melalui OASIS AgentGraph. Personality instances boleh berjalan concurrent ketika dependency tersedia. Report Agent tetap menunggu seluruh artifact upstream karena merupakan tahap sintesis.

## Non-functional traceability

| Requirement | Technical control | Verification |
|---|---|---|
| Usability | Wizard, status progres, input transaksi cepat, OCR review | Task test dan SUS >=70 |
| Reliability | Celery state machine, timeout, retry, partial result, error UI | Failure injection dan E2E |
| Security | Password hashing, JWT/session, tenant isolation, private object | Security integration tests |
| Accuracy | Deterministic finance/scoring, typed artifacts | Golden tests dan reconciliation 100% |
| Privacy | Data minimization, consent, private receipt storage, retention | Privacy/security checklist |
| Scalability | Frontend/API/worker/DB/Redis separation | Load test dan queue metrics |
| Accessibility | Semantic HTML, keyboard, contrast, readable charts | Automated + manual WCAG checks |
| Maintainability | Bounded contexts, versioned contracts, adapters | Architecture review dan contract tests |
| Compatibility | Chrome, Edge, Safari terbaru; responsive | Browser matrix E2E |

## Change control

- Priority dan scope pada tabel di atas bersifat fixed.
- Technical spike hanya memilih cara implementasi, bukan menghapus requirement.
- Jika library/provider bermasalah, gunakan adapter, fallback provider, atau fork terkontrol sambil mempertahankan behavior requirement.
- Pull request yang menyentuh requirement wajib memperbarui mapping API, test, dan dokumentasi terkait.

