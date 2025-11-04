import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolve } from 'path'

export default defineVitestConfig({
  test: {
    setupFiles: [resolve('./tests/setup.ts')]
  }
})
