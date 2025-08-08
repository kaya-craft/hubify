import 'nuxt/app'

declare module 'nuxt/app' {
  interface RuntimeNuxtHooks {
    'collection:updated': (collection: TableNames) => void
  }
}
