# Docs — Writing Rules

Aturan untuk repository dokumentasi.

## Lima aturan yang berlaku di seluruh produk

SimuMarket AI terdiri dari tiga repository terpisah: repository ini sebagai sumber kebenaran, [SimuMarketAI](https://github.com/NextGen-Manager/SimuMarketAI) untuk frontend, dan [SimuMarketAI-BE](https://github.com/NextGen-Manager/SimuMarketAI-BE) untuk backend. Lima aturan berikut berlaku di ketiganya, dan dokumen apa pun di sini tidak boleh menuliskan sesuatu yang melanggarnya.

1. **LLM tidak pernah menjadi sumber angka otoritatif.** Skor, BEP, marjin, payback, dan seluruh agregat dihitung kode deterministik.
2. **Setiap angka yang tampil punya provenance.** Nilai, satuan, sumber, waktu pengambilan, dan tingkat keyakinan.
3. **Kegagalan parsial tidak boleh disamarkan.** Status `partial` tetap `partial`.
4. **Uang adalah integer rupiah.** Tidak ada `float` di jalur uang.
5. **Data pengguna tidak bocor ke prompt.** Nama pelanggan, nomor telepon, teks struk mentah, dan catatan bebas tidak pernah dikirim ke penyedia LLM.

**Git.** Jangan commit atau push kecuali diminta. Satu commit satu perubahan logis.

## Peran repository ini

Repository ini adalah **sumber kebenaran**. Kode mengikuti dokumen, bukan sebaliknya. Kalau implementasi menyimpang, yang diperbaiki adalah implementasinya — kecuali ada ADR yang menyatakan dokumen yang perlu berubah.

## Struktur

```text
README.md          indeks dan ketetapan teknis
docs/01..14        dokumen teknis bernomor
docs/adr/          architecture decision record
```

Dokumen baru mendapat nomor berikutnya dan **wajib** ditambahkan ke daftar di `README.md`. Dokumen yang tidak terdaftar dianggap tidak ada.

## Requirement bersifat fixed

Tabel traceability di `docs/01-technical-requirements-traceability.md` mengunci scope. Aturan:

- Jangan menghapus, memindahkan, atau menurunkan prioritas requirement tanpa instruksi eksplisit product owner.
- Spike teknis memilih *cara* implementasi, bukan menghapus requirement.
- Kalau library atau provider bermasalah, buat adapter, fallback, atau fork terkontrol — jangan potong requirement.
- Perubahan yang menyentuh requirement wajib memperbarui mapping API, test, dan dokumen terkait dalam satu perubahan.

## Kapan menulis ADR

Buat ADR **sebelum** pekerjaan dimulai, bukan sesudah, untuk:

- pergantian atau kenaikan major version framework;
- perubahan batas antara OASIS dan kode deterministik;
- perubahan bobot atau ambang scoring;
- pergantian penyedia data atau LLM;
- perubahan bentuk endpoint yang sudah dipakai frontend.

Format ADR mengikuti `adr/ADR-001-oasis-boundary.md`: Context, Decision, Consequences (positive dan negative), Alternatives rejected, Validation, References. Alternatif yang ditolak wajib diisi dengan alasannya — bagian itu yang membuat ADR berguna enam bulan kemudian.

ADR tidak dihapus. Yang usang diberi status `Superseded by ADR-XXX`.

## Gaya penulisan

- **Prosa Bahasa Indonesia, istilah teknis Bahasa Inggris.** Ikuti gaya dokumen yang sudah ada.
- Judul dokumen dan heading dalam Bahasa Indonesia.
- Nama field, endpoint, state, dan istilah kode tetap Inggris dan ditulis dalam backtick.
- Kalimat pendek. Satu paragraf satu gagasan.
- Tabel untuk hal yang punya dimensi tetap; prosa untuk hal yang butuh alasan.
- Diagram memakai Mermaid atau blok `text`. Jangan menyisipkan gambar biner.

## Aturan isi

- **Setiap angka dan klaim teknis harus dapat ditelusuri.** Kalau berasal dari audit atau pemeriksaan, sebutkan tanggal dan versinya.
- **Bedakan yang sudah tervalidasi dari yang masih hipotesis.** Bobot scoring saat ini berstatus `unvalidated`; jangan menulisnya seolah sudah terbukti.
- **Tulis juga yang tidak dipakai.** Daftar "yang tidak dipakai di MVP" mencegah orang menambahkannya diam-diam.
- **Konsekuensi negatif wajib ditulis.** Dokumen yang hanya memuat keuntungan tidak dapat dipercaya.
- Jangan menulis persentase kemajuan. Tulis artifact yang sudah ada dan yang belum.

## Konsistensi lintas dokumen

Kalau mengubah salah satu hal berikut, periksa seluruh dokumen yang menyebutkannya:

| Hal | Muncul di |
|---|---|
| Nama dan urutan state analysis | 02, 06, 12, 13 |
| Formula finansial | 05, dan golden test backend |
| Bentuk endpoint dan payload | 06, 12, dan skema di frontend |
| Nama council dan personality | 01, 03, 04, 12, 13 |
| Versi dependency | 01, 14, README kedua repo kode |
| Requirement ID F-01..F-16 | 01, 12 |

Ketidakcocokan antar dokumen lebih berbahaya daripada dokumen yang belum lengkap, karena pembaca tidak tahu mana yang benar.

## Yang tidak boleh masuk repository ini

- Kunci API, `.env`, kredensial, atau secret dalam bentuk apa pun.
- Data pengguna nyata: foto struk, transaksi, nama, nomor telepon.
- Trace OASIS atau PDF hasil run.
- Dump database.
- Screenshot yang memuat data asli tanpa disamarkan.

## Sebelum menyatakan selesai

- Dokumen baru terdaftar di `README.md`.
- Tautan antardokumen menggunakan path relatif dan benar-benar mengarah ke file yang ada.
- Istilah dan nama state konsisten dengan dokumen lain.
- Tanggal verifikasi ditulis bila dokumen memuat versi dependency atau fakta eksternal.
