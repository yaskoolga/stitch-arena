import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

// Can be imported from a shared config
export const locales = ['en', 'ru', 'de', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // Get locale from cookie or Accept-Language header
  const cookieStore = await cookies();
  const headersList = await headers();

  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value;
  const acceptLanguage = headersList.get('accept-language');

  // Determine locale priority: cookie > accept-language > default
  let locale: string = 'en';

  if (localeCookie && locales.includes(localeCookie as Locale)) {
    locale = localeCookie;
  } else if (acceptLanguage) {
    // Parse accept-language header (e.g., "ru-RU,ru;q=0.9,en-US;q=0.8")
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0];
    if (locales.includes(preferredLang as Locale)) {
      locale = preferredLang;
    }
  }

  // Import messages statically to avoid dynamic import issues in build
  let messages;
  switch (locale) {
    case 'ru':
      messages = (await import('../messages/ru.json')).default;
      break;
    case 'de':
      messages = (await import('../messages/de.json')).default;
      break;
    case 'fr':
      messages = (await import('../messages/fr.json')).default;
      break;
    case 'es':
      messages = (await import('../messages/es.json')).default;
      break;
    default:
      messages = (await import('../messages/en.json')).default;
  }

  return {
    locale,
    messages,
  };
});
