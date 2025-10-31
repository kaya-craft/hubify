import { defineNuxtConfig } from 'nuxt/config'
import { resolve } from 'path'

export default defineNuxtConfig({
  extends: ['@hubify/api'],

  modules: [
    '@nuxt/test-utils/module',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n'
  ],

  css: [resolve(__dirname, 'app/assets/css/main.css')],

  // routeRules: {
  //   /**
  //    * Proxy requests to the Iconify API. Cache responses based on query parameters for 24 hours.
  //    */
  //   '/api/iconify/**': {
  //     proxy: 'https://api.iconify.design/**',
  //     cache: {
  //       maxAge: 60 * 60 * 24, // 24 hours
  //       varies: ['query'],
  //       swr: true
  //     }
  //   }
  // },

  vite: {
    optimizeDeps: {
      exclude: ['@nuxt/ui/utils/tv']
    }
  },

  hooks: {
    'vite:extendConfig': extendViteConfig
  },

  i18n: {
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' }
    ],
    defaultLocale: 'en'
  }

})

function extendViteConfig(config: import('vite').UserConfig) {
  const plugin = config.plugins?.find(plugin => isPlugin(plugin, 'nuxt:environments'))
  if (plugin) plugin.enforce = 'pre'
}

function isPlugin(plugin: unknown, name: string): plugin is import('vite').Plugin {
  return !!(plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === name)
}
