import { resolve } from 'path'
import i18nConfig from './i18n/config'

export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', '@nuxt/ui-pro', '@nuxtjs/i18n', '@vueuse/nuxt'],
  pages: true,
  css: [resolve(__dirname, 'app/assets/css/main.css')],

  i18n: i18nConfig
})
