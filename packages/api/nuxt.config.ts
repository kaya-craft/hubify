import { resolve } from 'node:path'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', 'nuxt-auth-utils'],

  /**
   * This needs to be set because else the buildDir will be in
   * node_modules/.cache/nuxt which causes issues with nitro
   * not transpiling the generated schema file.
   */
  buildDir: './.nuxt',

  alias: {
    '#auth': resolve(__dirname, 'types/auth.ts')
  },

  nitro: {
    experimental: {
      websocket: true
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
