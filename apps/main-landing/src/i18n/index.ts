/**
 * Same setup as main-clinic / main-patient (i18next + browser language detector, languages en / zh / fr),
 * so the landing page, the portals and the saved language stay in step:
 *  - the choice is cached in localStorage ("i18nextLng"), like the portals do;
 *  - links into the portals carry ?lng=<code> (see withLang), because each port has its own localStorage;
 *  - after sign-in, a language saved on the account (user.preferences.language) wins, like in the portals.
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'zh', label: '中文', short: 'ZH' },
  { code: 'fr', label: 'Français', short: 'FR' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, zh: { translation: zh }, fr: { translation: fr } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh', 'fr'],
    nonExplicitSupportedLngs: true, // zh-CN → zh, fr-CA → fr
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  })
  .catch(console.error);

function syncHtmlLang(lng: string): void {
  document.documentElement.lang = lng;
}
syncHtmlLang(i18n.resolvedLanguage ?? 'en');
i18n.on('languageChanged', syncHtmlLang);

/** Current language as one of en / zh / fr. */
export function currentLanguage(): LanguageCode {
  const lng = (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2);
  return (LANGUAGES.find((l) => l.code === lng)?.code ?? 'en') as LanguageCode;
}

/** Same rule as the portals' useLanguage().getLanguageCode. */
export function toLanguageCode(value: string | undefined): LanguageCode | undefined {
  if (!value) {
    return undefined;
  }
  return LANGUAGES.find((l) => value.toLowerCase().includes(l.code))?.code;
}

/** Add ?lng=<current language> to a URL that opens one of the portals. */
export function withLang(url: string): string {
  const u = new URL(url, window.location.href);
  u.searchParams.set('lng', currentLanguage());
  return u.toString();
}

export default i18n;
