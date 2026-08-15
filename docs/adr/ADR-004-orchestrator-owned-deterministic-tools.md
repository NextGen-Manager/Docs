# ADR-004: Deterministic Tools Dimiliki Orchestrator

- Status: Accepted
- Tanggal: 2026-08-16
- Owners: Tim SimuMarket AI
- Supersedes: detail pemanggilan tool pada ADR-001

## Context

ADR-001 menetapkan empat role inti sebagai OASIS agent dan mewajibkan angka finansial melewati deterministic calculator. Implementasi Phase 4 membuktikan bahwa kalkulator dapat dipanggil sebelum Finance Council menerima hasilnya. Sebaliknya, memberikan kalkulator sebagai autonomous LLM tool membuat keberhasilan perhitungan bergantung pada keputusan model untuk memanggil tool, memilih parameter, dan menyelesaikan tool loop. Itu tidak sesuai dengan posisi angka finansial sebagai hasil otoritatif.

OASIS memberi nilai utama pada environment sosial, profile, action, recommendation dynamics, interview, dan trace. Kemampuan itu digunakan penuh oleh Customer Persona Council. Market, Finance, dan Report tetap berupa `SocialAgent` di `AgentGraph`, tetapi deliberasinya dikendalikan orchestrator melalui structured `INTERVIEW` dan typed artifact handoff.

## Decision

- Keempat role tetap dibuat sebagai OASIS `SocialAgent` dalam satu `AgentGraph` per analysis run.
- Customer Persona menggunakan shared Reddit environment, recommendation refresh, social action, controlled intervention, dan baseline/final interview.
- Market, Finance, dan Report menggunakan sequential structured interview. Draft sebelumnya dan artifact hulu diberikan sebagai untrusted data, bukan melalui social feed.
- Evidence adapter, deterministic finance calculator, scoring engine, citation validator, dan arithmetic validator dipanggil oleh application orchestrator.
- Finance calculator selalu menghasilkan skenario minimum, dasar, dan maksimum dari bounds input sebelum Finance Council mengkritiknya. Agent tidak memilih apakah kalkulator dijalankan dan tidak dapat memperluas bounds.
- Pemanggilan deterministic tool dicatat sebagai application audit artifact dengan correlation ID yang sama. Interaction agent tetap dicatat pada OASIS trace.
- Nama domain action seperti `lookup_evidence` atau `validate_report` adalah capability contract, bukan klaim bahwa semuanya terdaftar sebagai autonomous CAMEL `FunctionTool`.
- Model default MVP sama untuk seluruh council. Routing model per role baru boleh diaktifkan setelah benchmark live dan manifest mampu mencatat mapping model per role.

## Consequences

### Positive

- Perhitungan wajib tetap berjalan walaupun agent gagal atau tidak memilih tool.
- Parameter uang dan skenario tidak berada di bawah kontrol LLM.
- Fake dan live adapter menjalankan urutan deterministic tool yang sama.
- Token dan latency lebih rendah karena tidak membutuhkan tool-selection turn tambahan.
- Batas antara sinyal sintetis dan angka otoritatif lebih mudah diaudit.

### Negative

- Market, Finance, dan Report tidak memakai seluruh kemampuan social platform OASIS.
- Demo harus menjelaskan bahwa nilai OASIS paling besar berada pada persona simulation dan trace, bukan autonomous finance tool calling.
- Tool call deterministik tersebar antara OASIS trace dan application audit artifact, sehingga correlation ID wajib dipertahankan.
- Perubahan model per council belum tersedia pada manifest MVP.

## Alternatives rejected

### Memberikan finance calculator sebagai autonomous `FunctionTool`

Ditolak untuk MVP karena model dapat tidak memanggil tool, mengulang pemanggilan, atau memilih parameter yang berbeda antarrun. Clamping dapat mencegah angka di luar bounds, tetapi tidak menjamin ketiga skenario wajib selalu dihitung.

### Menjalankan seluruh council melalui social feed

Ditolak karena evidence critique dan report editing membutuhkan urutan artifact yang eksplisit. Recommendation feed dapat menyembunyikan atau mengurutkan ulang pesan, sehingga provenance menjadi lebih lemah daripada typed handoff.

### Mengeluarkan Market, Finance, dan Report dari OASIS

Ditolak karena requirement menetapkan empat agent inti berbasis OASIS. Ketiganya tetap `SocialAgent`, memiliki profile version, model, interview trace, dan council deliberation; yang tidak digunakan hanya social action yang tidak relevan dengan mandatnya.

## Validation

Keputusan dianggap terimplementasi bila:

- test membuktikan finance calculator selalu berjalan sebelum Finance Council;
- output Finance Council hanya dapat menunjuk tool call ID yang benar-benar ada;
- Market dan Report tidak memperoleh social action persona;
- persona round tetap memakai recommendation refresh dan action trace;
- kegagalan OASIS tidak menghapus deterministic finance dan score;
- live benchmark mencatat token dan latency tanpa mengubah boundary ini diam-diam.

## References

- [ADR-001](ADR-001-oasis-boundary.md)
- [Arsitektur agent OASIS](../03-oasis-agent-architecture.md)
- [Protokol simulasi](../04-simulation-protocol.md)
- [OASIS Actions](https://docs.oasis.camel-ai.org/key_modules/actions)
- [OASIS Interview](https://docs.oasis.camel-ai.org/cookbooks/twitter_interview)
