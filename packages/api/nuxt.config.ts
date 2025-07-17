export default defineNuxtConfig({
  modules: ['@nuxt/test-utils', 'nuxt-auth-utils'],

  nitro: {
    experimental: {
      database: true
    }
  },

  auth: {
    webAuthn: true
  }
})
