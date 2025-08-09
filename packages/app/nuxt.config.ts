import { resolve } from 'path'
import i18nConfig from './i18n/config'

export default defineNuxtConfig({
  extends: ['@hubify/api'],

  modules: ['@nuxt/test-utils', '@nuxt/ui-pro', '@nuxtjs/i18n', '@vueuse/nuxt'],

  pages: true,

  css: [resolve(__dirname, 'app/assets/css/main.css')],

  experimental: {
    typedPages: true
  },

  hubify: {
    fields: [resolve(__dirname, 'app/components/fields')],
    schema: [resolve(__dirname, 'schema')]
  },

  i18n: i18nConfig
})
