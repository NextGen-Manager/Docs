import Link from 'next/link';
import { localizedPath } from '@/lib/i18n';

const copy = {
  id: {
    eyebrow: 'Decision Support System untuk UMKM F&B',
    title: 'Pahami SimuMarket AI dari penggunaan hingga arsitekturnya.',
    description:
      'Panduan terbuka untuk pengguna, developer, reviewer, dan kontributor. Setiap kemampuan dibedakan secara jelas antara implementasi, demo, dan target.',
    docs: 'Buka dokumentasi',
    github: 'Lihat repository',
  },
  en: {
    eyebrow: 'Decision Support System for F&B MSMEs',
    title: 'Understand SimuMarket AI from user workflows to system architecture.',
    description:
      'Open guidance for users, developers, reviewers, and contributors. Every capability is clearly identified as implemented, demonstrated, or planned.',
    docs: 'Open documentation',
    github: 'View repository',
  },
} as const;

export default async function HomePage({ params }: { params: Promise<{ lang: 'id' | 'en' }> }) {
  const { lang } = await params;
  const text = copy[lang];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-6 py-20">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-fd-primary">
        {text.eyebrow}
      </p>
      <h1 className="max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">{text.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-fd-muted-foreground">
        {text.description}
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href={localizedPath(lang, '/docs')}
          className="rounded-full bg-fd-primary px-5 py-3 font-semibold text-fd-primary-foreground"
        >
          {text.docs}
        </Link>
        <Link
          href="https://github.com/NextGen-Manager"
          className="rounded-full border border-fd-border px-5 py-3 font-semibold"
        >
          {text.github}
        </Link>
      </div>
    </main>
  );
}

