import { resolve } from 'path'

export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', '@nuxt/ui-pro', '@nuxtjs/i18n'],
  pages: true,
  css: [resolve(__dirname, 'app/assets/css/main.css')],
  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
    ],
    defaultLocale: 'en',
  },
})
