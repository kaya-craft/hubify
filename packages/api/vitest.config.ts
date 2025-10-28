import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    setupFiles: [resolve('./test/setup.ts')]
  }
})
