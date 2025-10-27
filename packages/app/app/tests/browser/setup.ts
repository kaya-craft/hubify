import { locators } from 'vitest/browser'
import type { Locator } from 'vitest/browser'
import 'vitest-browser-vue'
import { vi } from 'vitest'

import heroicons from '@iconify-json/heroicons/icons.json'
import lucide from '@iconify-json/lucide/icons.json'
import mdi from '@iconify-json/mdi/icons.json'
import simpleIcons from '@iconify-json/simple-icons/icons.json'
import { addCollection } from '@iconify/vue'

vi.stubGlobal('useI18n', () => ({
  t: (key: string) => key
}))

vi.stubGlobal('useLocaleRoute', vi.fn(() => route => route))

const originalConsoleWarn = console.warn
const originalConsoleError = console.error

// Ignore Vue warn logs
function shouldSilenceRouterLinkWarning(message: unknown) {
  return typeof message === 'string' && message.startsWith('[Vue warn]: Failed to resolve component: RouterLink')
}

console.warn = (...args: Parameters<typeof console.warn>) => {
  if (shouldSilenceRouterLinkWarning(args[0])) return
  originalConsoleWarn(...args)
}

console.error = (...args: Parameters<typeof console.error>) => {
  if (shouldSilenceRouterLinkWarning(args[0])) return
  originalConsoleError(...args)
}

locators.extend({
  getById(id: string) {
    return '#' + id
  },
  getByTag(tag: string) {
    return tag
  }
})

declare module 'vitest/browser' {
  interface LocatorSelectors {
    getById: (id: string) => Locator
    getByTag: (tag: string) => Locator
  }
}

addCollection(lucide)
addCollection(heroicons)
addCollection(mdi)
addCollection(simpleIcons)
