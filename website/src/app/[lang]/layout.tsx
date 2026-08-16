import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { i18n, isLocale } from '@/lib/i18n';
import { siteUrl } from '@/lib/shared';
import type { Metadata } from 'next';
import { AppRootProvider } from '@/components/root-provider';
import '../global.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEnglish = lang === 'en';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: isEnglish ? 'SimuMarket AI Documentation' : 'Dokumentasi SimuMarket AI',
      template: '%s | SimuMarket AI',
    },
    description: isEnglish
      ? 'Open documentation for using, integrating, and understanding SimuMarket AI.'
      : 'Dokumentasi terbuka untuk menggunakan, mengintegrasikan, dan memahami SimuMarket AI.',
    alternates: {
      canonical: isEnglish ? '/en' : '/',
      languages: { id: '/', en: '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: 'SimuMarket AI',
      locale: isEnglish ? 'en_US' : 'id_ID',
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html lang={lang} className={montserrat.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <AppRootProvider locale={lang}>{children}</AppRootProvider>
      </body>
    </html>
  );
}
