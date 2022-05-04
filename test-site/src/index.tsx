import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { i18n, es } from '@yext/answers-react-components';
import { useTranslation } from 'react-i18next';
import './i18n';

i18n.addResourceBundle('es', 'translation', es);
i18n.changeLanguage('es');

ReactDOM.render(
  <React.StrictMode>
      <App />
      <TestComponent />
  </React.StrictMode>,
  document.getElementById('root')
);

function TestComponent() {
  const { t } = useTranslation();
  return <>{t('Sample translation with interpolated {{value}}', { value: 'Slapchop' })}</>
}