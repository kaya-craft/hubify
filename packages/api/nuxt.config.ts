export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', 'nuxt-auth-utils'],

  nitro: {
    experimental: {
      database: true
    },
    database: {
      hubify: {
        connector: 'node-sqlite'
      }
    }
  },

  auth: {
    webAuthn: true
  }
})
