import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: [resolve('./test/setup.ts')]
  }
})
