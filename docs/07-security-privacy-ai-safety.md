# Security, Privacy, dan AI Safety

## Data classification

| Class | Contoh | Perlakuan |
|---|---|---|
| Public | Konten edukasi terpublikasi | Dapat dicache; tetap versioned |
| Internal | Prompt template, scoring rule draft | Akses tim; perubahan diaudit |
| Confidential | Profil usaha, biaya, transaksi | Encryption, tenant isolation, least privilege |
| Secret | Password hash, JWT signing key, provider API key | Secret manager/env injection; tidak pernah masuk log/repo |

Data transaksi bukan data latihan model secara default. Persetujuan pemrosesan untuk menghasilkan insight tidak sama dengan persetujuan training.

## Authentication baseline

- Password di-hash dengan Argon2id atau bcrypt dengan parameter yang ditinjau; proposal boleh menyebut bcrypt, tetapi implementasi mengikuti library aman yang dipilih tim.
- Access token berumur pendek; refresh token dirotasi dan dapat dicabut.
- Rate limit login dan pembuatan job mahal.
- Cookie browser memakai `HttpOnly`, `Secure`, dan `SameSite` yang tepat bila token disimpan dalam cookie.
- CORS allowlist eksplisit.
- Semua query resource menyertakan owner/tenant scope.

## Privacy by design

- Kumpulkan hanya data yang dibutuhkan untuk fitur.
- Koordinat presisi hanya disimpan bila diperlukan; untuk report publik gunakan area agregat.
- Jangan kirim email, nomor telepon, nama pelanggan, catatan bebas transaksi, atau receipt mentah ke LLM.
- Pseudonymize `user_id`, `business_id`, dan `analysis_id` sebelum external inference.
- Tetapkan retention untuk OASIS trace, log, PDF, dan deleted account.
- Sediakan export dan deletion workflow yang benar-benar menghapus/menjadwalkan penghapusan artifact terkait.

## LLM threat model

### Prompt injection

Nama usaha, value proposition, evidence text, dan content eksternal dapat mengandung instruksi. Bungkus sebagai delimited untrusted data, jangan gabungkan menjadi system prompt, dan gunakan structured input.

### Hallucinated facts/numbers

LLM tidak boleh membuat angka report. Report composer menerima artifact typed; validator menolak angka yang tidak dapat dicocokkan dengan artifact ID.

### Sensitive data leakage

Gunakan allowlist field pada provider payload. Log metadata, bukan prompt penuh, kecuali debug environment dengan data sintetis.

### Cost denial-of-service

Rate limit per account, quota per run, payload limit, max persona/round, concurrency semaphore, token budget, dan kill switch provider.

### Model/provider drift

Pin exact model bila provider mendukung, simpan model ID dan prompt version, serta jalankan regression suite sebelum mengganti alias/default.

## Keamanan upload foto struk

- Upload memakai signed URL berumur pendek dan object key acak yang tenant-scoped.
- Validasi MIME berdasarkan magic bytes, bukan extension atau header client saja.
- Batasi format, ukuran file, pixel count, dan processing time untuk mencegah decompression bomb/DoS.
- Strip EXIF dan metadata lokasi jika tidak dibutuhkan.
- Object selalu privat dan terenkripsi; frontend tidak menerima permanent public URL.
- OCR worker membaca object melalui identity berizin minimum dan tidak mengeksekusi isi file.
- Raw image, raw OCR text, draft, dan transaksi final memiliki retention terpisah.
- Penghapusan akun mencakup object, OCR artifact, draft, dan referensi export terkait.

## Content safety dan fairness

- Persona mewakili kebutuhan/behavior; protected attributes hanya digunakan bila relevan, sah, dan tervalidasi.
- Jangan membuat rekomendasi diskriminatif berdasarkan agama, etnis, disabilitas, atau atribut sensitif.
- Legal/halal/PIRT content harus dikurasi dari sumber resmi. Istilah “sertifikasi halal MUI” perlu diperbarui sesuai peran BPJPH dan proses yang berlaku; jangan hard-code panduan hukum tanpa tanggal review.
- Rekomendasi finansial menyebut asumsi dan bukan nasihat investasi/kredit.
- Kutipan persona selalu berlabel “respons sintetis”, tidak menggunakan nama warga nyata.

## Audit events minimum

- login success/failure dan token revocation;
- consent create/revoke;
- business profile and transaction create/update/delete;
- analysis create/cancel/retry/export;
- admin access;
- rule/prompt/content version publish;
- data export/account deletion.

Audit event berisi actor, action, resource ID, timestamp, outcome, dan correlation ID; jangan simpan secret atau payload sensitif penuh.

## Incident minimum playbook

1. Matikan provider/job path melalui feature flag bila terjadi runaway cost atau leakage.
2. Revoke secret/token terkait.
3. Pertahankan log yang diperlukan tanpa menyebarkan data lebih jauh.
4. Identifikasi scope user/artifact terdampak.
5. Perbaiki, rotate, dan regression test.
6. Dokumentasikan timeline dan tindakan komunikasi sesuai kewajiban yang berlaku.

## Pre-release checklist

- Dependency dan secret scanning lulus.
- Tidak ada `.env`, key, dump database, OASIS trace, atau PDF user di Git.
- Authorization test lintas user lulus.
- Backup dan restore PostgreSQL diuji.
- Retention/cleanup artifact diuji.
- Provider data-use setting dan contract ditinjau.
- Privacy notice menjelaskan AI provider, tujuan pemrosesan, retention, dan hak pengguna.
- Disclaimer tampil pada report dan export, bukan hanya landing page.
