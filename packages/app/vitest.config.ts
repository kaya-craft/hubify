import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

import { resolveModule } from 'nuxt/kit'
import { resolve } from 'path'

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: 'composables',
          include: ['./app/tests/composables/**/*.test.ts'],
          environment: 'nuxt',
          setupFiles: ['./app/tests/composables/setup.ts']
        }
      }),
      await defineVitestProject({
        test: {
          name: 'browser',
          browser: {
            viewport: { width: 1280, height: 720 },
            enabled: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }]
          },
          environment: 'nuxt',
          environmentOptions: {
            nuxt: {
              overrides: {
                alias: {
                  '#hubify/schema': resolve(__dirname, 'app/tests/browser/__mocks__/schema.ts')
                }
              }
            }
          },
          setupFiles: ['./app/tests/browser/setup.ts'],
          include: ['./app/tests/browser/**/*.test.ts'],
          alias: {
            'bind-event-listener': resolveModule('bind-event-listener')
          }
        },
        optimizeDeps: {
          include: ['bind-event-listener']
        }
      })
    ]
  }
})
