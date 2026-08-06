# SimuMarketAI Documentation

Dokumentasi lintas-repository untuk SimuMarketAI, toolkit decision support bagi calon dan pelaku UMKM F&B di Jabodetabek.

## Repository map

| Repository | Peran |
|---|---|
| [SimuMarketAI](https://github.com/NextGen-Manager/SimuMarketAI) | Frontend Next.js |
| [SimuMarketAI-BE](https://github.com/NextGen-Manager/SimuMarketAI-BE) | Backend, deterministic engines, dan integrasi OASIS |
| [Docs](https://github.com/NextGen-Manager/Docs) | Product, architecture, research, API, quality, dan delivery |

## Dokumentasi teknis

1. [Fixed technical requirements dan traceability](docs/01-technical-requirements-traceability.md)
2. [Arsitektur sistem](docs/02-system-architecture.md)
3. [Arsitektur empat agent inti berbasis OASIS](docs/03-oasis-agent-architecture.md)
4. [Protokol simulasi multi-agent](docs/04-simulation-protocol.md)
5. [Data, financial engine, dan scoring](docs/05-data-evidence-and-scoring.md)
6. [Kontrak API](docs/06-api-contract.md)
7. [Security, privacy, dan AI safety](docs/07-security-privacy-ai-safety.md)
8. [Strategi testing teknis](docs/08-testing-and-evaluation.md)
9. [Roadmap implementasi MVP](docs/09-mvp-roadmap.md)
10. [Database dan storage design](docs/10-database-and-storage-design.md)
11. [Deployment dan observability](docs/11-deployment-and-observability.md)
12. [Workflow aplikasi end-to-end](docs/12-application-workflow.md)
13. [UI system dan rencana mock interaktif](docs/13-ui-system-and-mock-plan.md)
14. [Keputusan tech stack dan version pinning](docs/14-tech-stack-decisions.md)
15. [ADR-001: empat agent OASIS dan deterministic tools](docs/adr/ADR-001-oasis-boundary.md)
16. [ADR-002: menaikkan frontend ke Next.js 16](docs/adr/ADR-002-frontend-framework-version.md)

## Ketetapan teknis

- SimuMarket AI adalah **Decision Support System**, bukan pemberi jaminan keberhasilan usaha.
- Angka finansial dan score dihitung deterministik; LLM tidak boleh menjadi kalkulator otoritatif.
- Empat agent inti—Market Analyst, Customer Persona, Finance, dan Report—diimplementasikan di atas orkestrasi OASIS.
- Setiap jenis agent dapat memiliki beberapa personality/instance yang berdebat secara terstruktur.
- Setiap angka yang tampil harus memiliki nilai, satuan, sumber, waktu pengambilan, dan tingkat keyakinan.
- Implementasi harus tetap memberi hasil parsial yang jujur saat data atau provider AI gagal.
- Input transaksi manual, batch, dan foto struk termasuk MVP.

## Status dokumentasi

Dokumen ini adalah baseline teknis per 5 Agustus 2026 berdasarkan requirement proposal dan audit terhadap `camel-ai/oasis` commit `bb0e1a87d8c1e6447a737775d4362b6d5695032b` (31 Juli 2026; package version `0.2.5`). Requirement proposal diperlakukan sebagai fixed scope; perubahan arsitektur signifikan harus dicatat melalui ADR.
