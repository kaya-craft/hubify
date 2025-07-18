import { resolve } from 'node:path'

export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', 'nuxt-auth-utils'],

  alias: {
    '#auth': resolve(__dirname, 'types/auth.ts')
  },

  nitro: {
    experimental: {
      database: true
    },

    database: {
      hubify: {
        connector: 'node-sqlite'
      }
    },

    imports: {
      imports: [
        {
          from: '#auth',
          type: true
        }
      ]
    }
  },

  auth: {
    webAuthn: true
  }
})
