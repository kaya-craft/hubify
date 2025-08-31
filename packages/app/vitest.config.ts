import { defineVitestConfig } from '@nuxt/test-utils/config'
import { resolveModule } from 'nuxt/kit'

export default defineVitestConfig({
  test: {
    browser: {
      viewport: { width: 1280, height: 720 },
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }]
    },
    environment: 'nuxt',
    setupFiles: ['vitest-browser-vue', './app/tests/browser/setup.ts'],
    include: ['./app/tests/browser/**/*.test.ts'],
    alias: {
      'bind-event-listener': resolveModule('bind-event-listener')
    }
  },
  optimizeDeps: {
    include: ['bind-event-listener']
  }
})
