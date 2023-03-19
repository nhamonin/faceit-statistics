import i18next from 'i18next';

import { en, uk } from '#locales';

export async function initI18next() {
  await i18next.init({
    lng: ['en', 'uk'],
    fallbackLng: 'en',
    resources: {
      en,
      uk,
    },
    interpolation: {
      escapeValue: false,
    },
  });
}
