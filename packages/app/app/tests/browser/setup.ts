import { locators } from '@vitest/browser/context'
import { config } from 'vitest-browser-vue'
import { i18n } from '../__mocks__/i18n'
import { registerEndpoint } from '@nuxt/test-utils/runtime'
import countries from '../__mocks__/countries'
import '../__mocks__/schema'

config.global.plugins.push(i18n)
config.global.components.RouterLink = { render: () => null }

registerEndpoint('/api/items/countries', {
  method: 'GET',
  handler: () => ({
    items: countries.slice(0, DEFAULT_PAGE_SIZE),
    total_count: countries.length
  })
})

locators.extend({
  getById(id: string) {
    return `#${id}`
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
