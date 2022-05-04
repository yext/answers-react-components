import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

const i18n = createInstance({
  fallbackLng: 'en',
  debug: true,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },

  resources: {
    en: {
      translation: {
        '{{count}} Results': '{{count}} Results',
        'alternativeVerticals_one': '<span>The following category yielded results for - </span><strong>{{query}}</strong>',
        'alternativeVerticals_other': '<span>The following categories yielded results for - </span><strong>{{query}}</strong>'
      }
    },
  },
  react: {
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['strong', 'span']
  }
});

i18n.use(initReactI18next).init();

export default i18n;