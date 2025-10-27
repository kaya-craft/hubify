import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'
import i18nConfig from './i18n/config'

export default defineNuxtConfig({
  extends: ['@hubify/api'],

  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  ssr: false,

  pages: true,

  css: [resolve(__dirname, 'app/assets/css/main.css')],

  routeRules: {
    /**
     * Proxy requests to the Iconify API. Cache responses based on query parameters for 24 hours.
     */
    '/api/iconify/**': {
      proxy: 'https://api.iconify.design/**',
      cache: {
        maxAge: 60 * 60 * 24, // 24 hours
        varies: ['query'],
        swr: true
      }
    }
  },

  experimental: {
    typedPages: true
  },

  vite: {
    optimizeDeps: {
      exclude: ['@nuxt/ui/utils/tv']
    }
  },

  hubify: {
    inputs: [resolve(__dirname, 'app/components/inputs')],
    displays: [resolve(__dirname, 'app/components/displays')],
    schema: [resolve(__dirname, 'schema')]
  },

  i18n: i18nConfig
})
