# ADR-002: Menaikkan Frontend dari Next.js 14 ke 16

- Status: Accepted
- Tanggal diajukan: 2026-08-06
- Tanggal disetujui: 2026-08-06
- Owners: Tim SimuMarket AI

## Context

[Technical requirements](../01-technical-requirements-traceability.md) menetapkan Next.js 14 dan React 18 sebagai fixed technology baseline. README frontend menyatakan larangan upgrade major tanpa ADR. Dokumen ini adalah ADR yang diminta larangan tersebut.

Fakta yang diverifikasi pada 6 Agustus 2026:

- Next.js 14 mencapai **end of life pada 26 Oktober 2025**;
- patch terakhirnya, `14.2.35`, terbit Desember 2025;
- versi stabil saat ini adalah **16.3**, terbit 3 Agustus 2026;
- Next.js 15 ke atas membawa React 19.

Proposal ditulis ketika Next.js 14 masih didukung. Baseline itu tidak salah saat ditulis; ia menjadi usang karena waktu berlalu.

### Model dukungan Next.js

Next.js tidak memiliki jalur LTS terpisah. Setiap major version melewati dua fase: **Active LTS** selama ia menjadi major terbaru, lalu **Maintenance LTS** sampai dua tahun sejak tanggal rilisnya sendiri.

| Versi | Rilis | Status per 6 Agustus 2026 | Dukungan berakhir |
|---|---|---|---|
| 16 | 22 Okt 2025 | Active LTS | sekitar Okt 2027 |
| 15 | 21 Okt 2024 | Maintenance LTS | **21 Okt 2026** |
| 14 | Okt 2023 | berakhir | 26 Okt 2025 |

Major baru terbit kira-kira setahun sekali.

### Catatan penting: ini bukan migrasi

Repository frontend belum memiliki `package.json` maupun satu baris kode aplikasi. Tidak ada yang perlu di-upgrade — scaffold pertama cukup dibuat langsung di atas Next.js 16. Biaya keputusan ini nol selama belum ada kode.

## Decision

Naikkan frontend ke **Next.js 16.x + React 19**, dan perbarui baris terkait pada tabel fixed technology baseline.

Perubahan ini menyentuh versi implementasi, **bukan** scope requirement. Seluruh requirement F-01 sampai F-16 tetap berlaku tanpa perubahan prioritas.

## Rationale

**Keamanan.** Cabang EOL tidak menerima perbaikan kerentanan. Aplikasi ini menangani autentikasi, data biaya usaha, dan unggahan struk milik pengguna. Menjalankannya di framework tanpa patch adalah risiko yang tidak sebanding dengan keuntungan mempertahankan angka pada dokumen proposal.

**Penilaian kompetisi.** Juri teknis yang membuka `package.json` akan melihat framework EOL. Mempertahankan 14 lebih mungkin dibaca sebagai kelalaian daripada sebagai kedisiplinan mengikuti proposal.

**Biaya migrasi rendah saat ini.** Belum ada satu baris kode aplikasi di repository frontend. Biaya perpindahan hari ini mendekati nol; biaya yang sama pada Sprint 3 akan jauh lebih besar.

**Tanpa itu, dependency lain ikut tertahan.** Sebagian pustaka React yang relevan sudah mensyaratkan React 19.

## Consequences

### Positive

- Menerima patch keamanan selama masa lomba.
- Bebas memilih pustaka mutakhir tanpa akrobat kompatibilitas.
- Tailwind v4 dan tooling terkait berjalan pada jalur yang didukung.

### Negative

- Dokumen proposal menyebut Next.js 14; perbedaan ini harus dijelaskan di laporan akhir, bukan disembunyikan. Penjelasannya justru menjadi bukti kedewasaan teknis: tim memantau lifecycle dependency dan mencatat keputusannya.
- React 19 mengubah sebagian pola (`ref` sebagai prop, perubahan pada beberapa API). Tim perlu membaca panduan upgrade meski memulai dari nol.
- Ekosistem pihak ketiga yang tertinggal harus diperiksa satu per satu saat dipilih.

## Alternatives considered

### Tetap di Next.js 14

Ditolak. Menjalankan produk yang menangani kredensial dan data finansial pengguna di atas framework tanpa patch keamanan tidak dapat dibenarkan hanya untuk kesesuaian tekstual dengan proposal.

### Naik ke Next.js 15

Ditolak. Versi 15 sudah membawa React 19 dan secara angka lebih dekat dengan proposal, tetapi **dukungan keamanannya berakhir 21 Oktober 2026** — berpotensi tepat di sekitar masa lomba. Memilih 15 berarti mengulang persoalan yang sama dengan versi 14 hanya beberapa bulan kemudian.

### Pindah dari Next.js sepenuhnya

Ditolak. Requirement menetapkan Next.js, dan tidak ada masalah teknis yang menuntut penggantian framework — hanya versinya yang usang.

## Validation

Keputusan dianggap terbukti bila:

- scaffold frontend berjalan pada Next.js 16 dengan `tsc --noEmit` bersih;
- Tailwind v4 dan token dari [UI system](../13-ui-system-and-mock-plan.md) merender benar di light dan dark;
- pipeline mock klik-melalui berjalan tanpa masalah khusus versi;
- audit dependency tidak menunjukkan kerentanan tingkat tinggi pada rantai framework.

Bila salah satu gagal dan penyebabnya melekat pada versi 16, turunkan ke 15 dan perbarui ADR ini — jangan kembali ke 14.

## References

- [Panduan upgrade Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Jadwal EOL Next.js](https://endoflife.date/nextjs)
- [Keputusan tech stack](../14-tech-stack-decisions.md)
