import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { i18n } from './i18n';
import { uiTranslations } from 'fumadocs-ui/i18n';

export const translations = i18n
  .translations()
  .extend(uiTranslations())
  .add({
    id: {
      displayName: 'Bahasa Indonesia',
      'Ask AI(AI chat button)': 'Tanya AI',
      'Back to Home(404 not found page)': 'Kembali ke beranda',
      'Choose a language(language switcher)': 'Pilih bahasa',
      'Choose a language(language switcher)(aria-label)': 'Pilih bahasa',
      'Close Banner(banner)(aria-label)': 'Tutup banner',
      'Close Search(search dialog)(aria-label)': 'Tutup pencarian',
      'Close Sidebar(aria-label)': 'Tutup sidebar',
      'Close Sidebar(sidebar)(aria-label)': 'Tutup sidebar',
      'Collapse Sidebar(sidebar)(aria-label)': 'Ciutkan sidebar',
      'Copied Text(code block)(aria-label)': 'Teks disalin',
      'Copy Anchor Link(heading anchor)(aria-label)': 'Salin tautan bagian',
      'Copy Link(accordion)(aria-label)': 'Salin tautan',
      'Copy Markdown(page actions)': 'Salin Markdown',
      'Copy Text(code block)(aria-label)': 'Salin teks',
      'Dark(theme switcher)(aria-label)': 'Gelap',
      'Default(type table)': 'Default',
      'Edit on GitHub(edit page)': 'Edit di GitHub',
      'Hide Sidebar(sidebar)': 'Sembunyikan sidebar',
      'Last updated on(page footer)': 'Terakhir diperbarui',
      'Layout Tab(layout tab trigger)': 'Tab layout',
      'Light(theme switcher)(aria-label)': 'Terang',
      'Next Page(pagination)': 'Halaman berikutnya',
      'No Headings(table of contents)': 'Tidak ada heading',
      'No results found(search dialog)': 'Tidak ada hasil',
      'On this page(table of contents)': 'Di halaman ini',
      'Open Search(search trigger)(aria-label)': 'Buka pencarian',
      'Open Sidebar(aria-label)': 'Buka sidebar',
      'Open Sidebar(sidebar)(aria-label)': 'Buka sidebar',
      'Open in ChatGPT(page actions)': 'Buka di ChatGPT',
      'Open in Claude(page actions)': 'Buka di Claude',
      'Open in Cursor(page actions)': 'Buka di Cursor',
      'Open in GitHub(page actions)': 'Buka di GitHub',
      'Open in Scira AI(page actions)': 'Buka di Scira AI',
      'Open(page actions)': 'Buka',
      'Page Not Found(404 not found page)': 'Halaman tidak ditemukan',
      'Parameters(type table)': 'Parameter',
      'Previous Page(pagination)': 'Halaman sebelumnya',
      'Prop(type table)': 'Properti',
      'Read {url}, I want to ask questions about it.(page actions)':
        'Baca {url}, saya ingin bertanya tentang halaman ini.',
      'Returns(type table)': 'Mengembalikan',
      'Search(search dialog)': 'Cari dokumentasi',
      'Search(search trigger)': 'Cari',
      'Show Sidebar(sidebar)': 'Tampilkan sidebar',
      'System(theme switcher)(aria-label)': 'Sistem',
      'Table of Contents(inline table of contents)': 'Daftar isi',
      'The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.(404 not found page)':
        'Halaman mungkin telah dihapus, berganti nama, atau sedang tidak tersedia.',
      'Toggle Menu(home layout header)(aria-label)': 'Buka atau tutup menu',
      'Toggle Theme(theme switcher)(aria-label)': 'Ganti tema',
      'Type(type table)': 'Tipe',
      'View as Markdown(page actions)': 'Lihat sebagai Markdown',
    },
    en: {
      displayName: 'English',
    },
  });

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
    i18n: true,
  };
}
