# ADR-005: Pemilihan Provider OASIS melalui Environment

- Status: Accepted
- Tanggal: 2026-08-16
- Owners: Tim SimuMarket AI

## Context

Integrasi OASIS saat ini memakai CAMEL `ModelFactory`, tetapi binding live masih memilih `ModelPlatformType.GEMINI` dan `GEMINI_API_KEY` secara langsung. Pada saat yang sama, manifest analysis sudah menyimpan `provider` dan `model_id`, dan CAMEL 0.2.78 menyediakan model adapter untuk Gemini maupun OpenAI. Menambah OpenAI tidak memerlukan perubahan pada council protocol, artifact schema, atau deterministic engine, tetapi pemilihan provider harus eksplisit dan dapat diaudit.

Provider tidak boleh dipilih dari request pengguna. Pemilihan per request akan membuat biaya, perilaku model, dan reproducibility berbeda tanpa kontrol deployment. Provider dan model juga tidak boleh disimpulkan dari nama environment variable atau dari key yang kebetulan tersedia karena konfigurasi tersebut ambigu ketika lebih dari satu key dipasang.

Ketiadaan key tetap merupakan konfigurasi degradasi yang sah. Sesuai ADR-001 dan protokol kegagalan OASIS, analysis harus tetap menghasilkan bagian deterministik dan menyatakan simulasi tidak tersedia melalui status `partial`, bukan gagal saat aplikasi diimpor atau memakai adapter fake.

## Decision

- `OASIS_PROVIDER` dipilih per deployment dan hanya menerima `gemini` atau `openai`.
- `OASIS_MODEL_ID` dipilih melalui environment dan harus cocok dengan provider. Model Gemini menggunakan prefix `gemini-`; model OpenAI untuk jalur ini menggunakan prefix `gpt-`. Model dengan label `-preview` tetap ditolak.
- Kredensial tetap provider-specific: `GEMINI_API_KEY` untuk Gemini dan `OPENAI_API_KEY` untuk OpenAI. Tidak ada `LLM_API_KEY` generik dan tidak ada fallback otomatis ke key provider lain.
- Satu provider resolver memetakan pilihan deployment ke API key terpilih dan CAMEL `ModelPlatformType`. `LiveOasisAdapter` tetap menjadi satu adapter; council protocol dan validator artifact tidak diduplikasi per provider.
- Provider atau pasangan provider/model yang tidak didukung menggagalkan validasi konfigurasi saat startup.
- Key yang kosong tidak menggagalkan startup. Selector mengembalikan `UnavailableOasisAdapter`, dan pipeline menghasilkan limitation serta status `partial` sesuai kontrak yang sudah ada.
- Key yang salah atau kehabisan kuota diperlakukan sebagai kegagalan provider pada saat live call. Respons mentah dan key tidak boleh masuk error publik atau log.
- `provider` dan `model_id` persis yang digunakan tetap disimpan pada run manifest bersama versi OASIS, CAMEL, prompt, cohort, dan seed.
- Logging meredaksi `OPENAI_API_KEY` dengan aturan yang sama seperti kredensial provider lain.
- Pemilihan model per council tidak ditambahkan. Seluruh council dalam satu run tetap memakai provider dan model deployment yang sama sampai benchmark live dan manifest per-role tersedia.

## Consequences

### Positive

- Deployment dapat berpindah antara Gemini dan OpenAI tanpa mengubah kode atau kontrak API.
- Manifest tetap menjelaskan provider dan model yang menghasilkan setiap artifact agent.
- Council, privacy sanitizer, budget, timeout, dan validator yang sama berlaku untuk kedua provider.
- Key yang tidak tersedia tidak mematikan finance, scoring, atau report deterministik.
- Tidak ada fallback provider tersembunyi yang membuat biaya dan hasil run sulit dibandingkan.

### Negative

- Kedua jalur provider perlu contract test dan smoke test live terpisah.
- Prefix model bersifat fail-closed dan harus diperbarui melalui review ketika keluarga model baru akan dipakai.
- Perbedaan token accounting dan error provider tetap perlu dinormalisasi oleh adapter.
- Menyimpan dua key pada satu deployment memperbesar permukaan secret management walaupun hanya satu yang dipakai.

## Alternatives rejected

### Tetap hanya memakai Gemini

Ditolak karena membuat runtime bergantung pada satu provider meskipun boundary CAMEL dan run manifest sudah mendukung pemilihan provider secara eksplisit.

### Menggunakan satu `LLM_API_KEY`

Ditolak karena nama key tidak menjelaskan provider, menyulitkan rotasi, dan meningkatkan risiko key yang salah dikirim ke endpoint lain.

### Memilih provider dari key yang tersedia

Ditolak karena hasil bergantung pada urutan pemeriksaan konfigurasi. Deployment yang memiliki dua key dapat berpindah provider tanpa perubahan `OASIS_PROVIDER` yang tercatat.

### Membuat adapter live terpisah untuk Gemini dan OpenAI

Ditolak karena lifecycle OASIS, council protocol, sanitization, budget, dan artifact validation sama. Perbedaannya hanya resolver kredensial dan `ModelPlatformType` CAMEL.

### Memberikan pilihan provider kepada pengguna

Ditolak untuk MVP karena provider adalah kebijakan deployment, bukan input bisnis. Pilihan pengguna juga akan memperumit cost control, reproducibility, dan perbandingan antarrun.

## Validation

Keputusan dianggap terimplementasi bila:

- konfigurasi hanya menerima `gemini` dan `openai`;
- pasangan provider/model yang tidak cocok ditolak saat startup;
- selector memakai hanya key milik provider terpilih;
- key terpilih yang kosong menghasilkan `UnavailableOasisAdapter` dan run `partial`;
- resolver memetakan Gemini dan OpenAI ke `ModelPlatformType` yang tepat;
- run manifest menyimpan provider dan model persis dari konfigurasi;
- log redaction mencakup kedua nama key;
- seluruh test fake OASIS tetap berjalan tanpa network atau key nyata;
- smoke test live untuk setiap provider dijalankan saat key tersedia dan mencatat model, token, latency, schema failure, serta failure code.

## References

- [ADR-001](ADR-001-oasis-boundary.md)
- [ADR-004](ADR-004-orchestrator-owned-deterministic-tools.md)
- [Arsitektur agent OASIS](../03-oasis-agent-architecture.md)
- [Keputusan tech stack](../14-tech-stack-decisions.md)
- [CAMEL model documentation](https://docs.camel-ai.org/key_modules/models)
