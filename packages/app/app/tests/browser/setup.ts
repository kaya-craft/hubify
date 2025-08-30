import { locators } from '@vitest/browser/context'
import { vi } from 'vitest'

vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key
}))

locators.extend({
  getById(id: string) {
    return '#' + id
  },
  getByTag(tag: string) {
    return tag
  }
})

declare module '@vitest/browser/context' {
  interface LocatorSelectors {
    getById: (id: string) => Locator
    getByTag: (tag: string) => Locator
  }
}
