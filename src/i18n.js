// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/en.json';
import zh from './i18n/zh.json';
import es from './i18n/es.json'; 


const resources = {
  en: { translation: en },
  zh: { translation: zh },
  es: { translation: es },
};

// 检测浏览器语言
const localLang = localStorage.getItem('appLang');
const browserLang = navigator.language?.toLowerCase().startsWith('zh') ? 'zh' : 'en';
const initialLang = localLang || browserLang;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,      
    fallbackLng: 'en',     
    interpolation: { escapeValue: false },
    debug: false,
  });

export default i18n;