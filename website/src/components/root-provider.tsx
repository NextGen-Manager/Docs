'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18nProvider } from 'fumadocs-ui/i18n';
import { translations } from '@/lib/layout.shared';
import type { Locale } from '@/lib/i18n';

const searchHotKey = [
  {
    display: 'Ctrl/⌘',
    key: (event: KeyboardEvent) => event.ctrlKey || event.metaKey,
  },
  { display: 'K', key: 'k' },
];

export function AppRootProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  return (
    <RootProvider
      i18n={i18nProvider(translations, locale)}
      search={{ hotKey: searchHotKey }}
    >
      {children}
    </RootProvider>
  );
}
