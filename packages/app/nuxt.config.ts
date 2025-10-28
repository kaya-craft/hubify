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

  hooks: {
    /**
     * TEMPORARY WORKAROUND: Ensure that the `nuxt:environments` Vite plugin runs before other plugins.
     * This is necessary to properly replace environment variables in the code during tests.
     */
    'vite:extendConfig'(config) {
      const plugin = config.plugins?.find((plugin): plugin is import('vite').Plugin => {
        return !!(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'nuxt:environments')
      })
      if (plugin) plugin.enforce = 'pre'
    }
  },

  i18n: i18nConfig
})
