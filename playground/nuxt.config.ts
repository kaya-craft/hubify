export default defineNuxtConfig({
  extends: ['@hubify/app'],

  hubify: {
    schema: ['./schemas']
  }
})
