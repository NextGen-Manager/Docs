# SimuMarket AI Documentation

Website dokumentasi publik SimuMarket AI, dibangun dengan Next.js dan Fumadocs. Bahasa Indonesia adalah locale default; setiap halaman wajib mempunyai pasangan Bahasa Inggris.

## Menjalankan lokal

```bash
npm install
npm run dev -- --port 3001
```

Buka `http://localhost:3001`. Versi Inggris tersedia di `/en`.

## Perintah

```bash
npm run docs:validate
npm run lint
npm run types:check
npm run build
```

Referensi endpoint berasal dari snapshot OpenAPI backend. Dengan ketiga repository berada dalam satu parent directory:

```bash
npm run docs:export-openapi
npm run docs:generate
npm run docs:validate
```

File hasil generator tidak diedit manual. Perbaiki schema atau deskripsi backend, ekspor ulang snapshot, lalu jalankan generator.

## Struktur konten

- `content/docs/*.mdx`: Bahasa Indonesia.
- `content/docs/*.en.mdx`: pasangan Bahasa Inggris.
- `content/docs/**/meta.json`: navigasi Indonesia.
- `content/docs/**/meta.en.json`: navigasi Inggris.
- `openapi/simumarket-v1.json`: snapshot kontrak backend.

Catatan kerja internal di luar `website/content/docs` tidak masuk source Fumadocs, pencarian, atau sitemap publik.

## Deployment

Hubungkan repository `Docs` ke Vercel, pilih `website` sebagai Root Directory, Production Branch `main`, lalu gunakan domain `simumarket-docs.vercel.app`. Website tidak membutuhkan runtime secret.

Production deployment dijalankan oleh `.github/workflows/deploy-docs.yml` setelah quality gate pada setiap perubahan `website/**` di `main`. `vercel.json` menonaktifkan deployment Git bawaan Vercel untuk `main` agar satu commit tidak dibangun dua kali.

Tambahkan tiga repository secret di GitHub melalui **Settings > Secrets and variables > Actions**:

- `VERCEL_TOKEN`: access token dari Vercel Account Settings.
- `VERCEL_ORG_ID`: nilai `orgId` proyek.
- `VERCEL_PROJECT_ID`: nilai `projectId` proyek.

Untuk memperoleh dua ID terakhir, link proyek sekali dari direktori `website`:

```bash
npx vercel link
```

Baca `orgId` dan `projectId` dari `.vercel/project.json`. Direktori `.vercel` sudah diabaikan Git dan tidak boleh di-commit. Setelah secrets tersedia, jalankan workflow secara manual atau push perubahan berikutnya ke `main`.
