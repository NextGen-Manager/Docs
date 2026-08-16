import { defineI18n } from 'fumadocs-core/i18n';

export const i18n = defineI18n({
  defaultLanguage: 'id',
  languages: ['id', 'en'],
  hideLocale: 'default-locale',
  fallbackLanguage: null,
});

export type Locale = (typeof i18n.languages)[number];

export function isLocale(value: string): value is Locale {
  return i18n.languages.includes(value as Locale);
}

export function localizedPath(locale: string, path: string): string {
  return locale === i18n.defaultLanguage ? path : `/${locale}${path}`;
}

