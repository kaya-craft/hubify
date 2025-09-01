import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', 'nuxt-auth-utils'],

  alias: {
    '#auth': resolve(__dirname, 'types/auth.ts')
  },

  nitro: {
    experimental: {
      database: true,
      websocket: true
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
