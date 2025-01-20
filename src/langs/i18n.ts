import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.yml'
import zh from './zh.yml'

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
})

export default i18n
