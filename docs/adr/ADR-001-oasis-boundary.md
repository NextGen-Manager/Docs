# ADR-001: Empat Agent OASIS dengan Deterministic Tool Boundary

- Status: Accepted untuk empat-agent baseline; detail pemanggilan deterministic tool disempurnakan oleh ADR-004
- Tanggal: 2026-08-05
- Owners: Tim SimuMarket AI

## Context

Requirement menetapkan empat agent inti berbasis OASIS. OASIS menyediakan agent LLM, social platform, recommendation system, actions, tools, graph, dan trace. SimuMarket AI juga menetapkan financial engine serta scoring rule-based yang deterministik. Karena itu, kontrak teknis perlu memastikan seluruh role tetap OASIS agent sekaligus memaksa operasi numerik melewati tool deterministik.

## Decision

Gunakan arsitektur empat agent inti berbasis OASIS dengan deterministic tool boundary:

- Market Analyst, Customer Persona, Finance, dan Report seluruhnya dijalankan sebagai OASIS agent type.
- Setiap type memiliki beberapa personality instance yang berinteraksi melalui `AgentGraph` dan council protocol.
- Market data diambil dan dinormalisasi oleh evidence adapters.
- Financial Engine dan Scoring Engine adalah deterministic code.
- Finance Agent wajib memanggil deterministic calculator dan tidak boleh menghitung angka otoritatif melalui generasi teks.
- Report Agent menyusun typed artifacts lalu memanggil citation dan arithmetic validator; LLM tidak dapat menciptakan angka baru.
- Satu role dapat memiliki beberapa personality instance dan reducer. Ini disebut structured adversarial deliberation.
- Failure OASIS menghasilkan partial report, bukan kegagalan seluruh DSS.

## Consequences

### Positive

- Angka auditabel dan testable.
- Keempat agent inti konsisten menggunakan runtime, graph, interaction, action, intervention, interview, dan trace OASIS.
- Cost/latency dapat dibatasi dengan cohort kecil.
- Produk tetap berjalan saat LLM/provider gagal.
- Novelty lebih mudah dijelaskan dan diuji melalui ablation.

### Negative

- Orchestrator dan artifact schema menambah engineering.
- Dependency graph dan concurrency control lebih kompleks karena setiap type memiliki beberapa instance.
- Hasil simulation harus dikalibrasi dan selalu diberi limitation.
- OASIS SQLite trace memerlukan lifecycle/retention adapter terpisah.

## Alternatives rejected

### Empat instance tunggal tanpa personality council

Ditolak karena requirement membutuhkan variasi personality dan internal battle. Setiap agent type membutuhkan beberapa instance serta reducer agar perbedaan perspektif dapat ditelusuri.

### OASIS untuk seluruh backend

Ditolak karena OASIS bukan database bisnis, auth framework, financial calculator, atau rule engine.

### Tanpa OASIS, hanya prompt chain

Ditolak karena tidak memenuhi requirement multi-agent berbasis OASIS.

### Menyerahkan finance dan scoring langsung ke LLM

Ditolak karena bertentangan dengan requirement financial engine dan scoring rule-based yang deterministik.

## Validation

Keputusan dipertahankan bila Sprint 0 membuktikan:

- custom persona/profile dan action set bekerja;
- controlled intervention dan interview tersimpan di trace;
- structured extractor stabil;
- latency dan cost sesuai budget;
- output memberi insight tambahan dibanding single LLM baseline.

Jika spike menemukan incompatibility library, perbaikannya dilakukan pada adapter atau fork terkontrol tanpa menghapus requirement empat agent OASIS.

## References

- [OASIS repository](https://github.com/camel-ai/oasis)
- [OASIS paper](https://arxiv.org/abs/2411.11581)
- [CAMEL model documentation](https://docs.camel-ai.org/key_modules/models)
