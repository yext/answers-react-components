import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'es',
    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    resources: {
      en: {
        translation: {
          'Sample translation with interpolated {{value}}': 'Sample translation with interpolated {{value}}',
        }
      },
      es: {
        translation: {
          'Sample translation with interpolated {{value}}': 'Traducción de muestra con {{value}} interpolada',
        }
      },
    }
  });

export default i18n;