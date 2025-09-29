import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, vi } from 'vitest'
import { isRef, ref, type Ref } from 'vue'

interface ComposableStore {
  useStateMap: Map<string, Ref<unknown>>
  useStorageMap: Map<string, Ref<unknown>>
}

declare global {
  var __NUXT_COMPOSABLES_STATE__: Map<string, Ref<unknown>> | undefined
  var __NUXT_COMPOSABLES_STORAGE__: Map<string, Ref<unknown>> | undefined
}

const store = vi.hoisted<ComposableStore>(() => ({
  useStateMap: new Map<string, Ref<unknown>>(),
  useStorageMap: new Map<string, Ref<unknown>>()
}))

type TranslatorFn = (key: string, ...args: any[]) => string

const shared = vi.hoisted(() => ({
  fetch: vi.fn(),
  translator: vi.fn<TranslatorFn>(),
  toastSuccess: vi.fn(),
  toastAlert: vi.fn(),
  relation: { table: 'hubify_collections' as TableNames, toKey: 'collection_id' },
  getRelation: vi.fn()
}))

const originalFetch = (globalThis as { $fetch?: typeof $fetch }).$fetch

// Mock useState
mockNuxtImport('useState', () => {
  return <T>(key: string, init?: () => T) => {
    const map = store.useStateMap

    if (!map.has(key)) {
      const initial = init ? init() : undefined
      map.set(key, ref(initial) as Ref<T>)
    }

    return map.get(key) as Ref<T>
  }
})

// Mock useLocalStorage
mockNuxtImport('useLocalStorage', () => {
  return <T>(key: string, initialValue: T) => {
    const map = store.useStorageMap

    if (!map.has(key)) {
      map.set(key, ref(initialValue) as Ref<T>)
    }

    return map.get(key) as Ref<T>
  }
})

// Mock toValue
mockNuxtImport('toValue', () => {
  return (value: unknown) => {
    if (typeof value === 'function') {
      return (value as () => unknown)()
    }
    return isRef(value) ? value.value : value
  }
})

mockNuxtImport('useCustomToast', () => {
  return () => ({
    success: (...args: unknown[]) => shared.toastSuccess(...args),
    alert: (...args: unknown[]) => shared.toastAlert(...args)
  })
})

mockNuxtImport('useTable', () => {
  return () => ({
    getRelation: (...args: Parameters<typeof shared.getRelation>) => shared.getRelation(...args)
  })
})

// Global beforeEach
beforeEach(() => {
  vi.resetModules()
  store.useStateMap.clear()
  store.useStorageMap.clear()

  globalThis.__NUXT_COMPOSABLES_STATE__ = store.useStateMap
  globalThis.__NUXT_COMPOSABLES_STORAGE__ = store.useStorageMap

  shared.fetch = vi.fn()
  shared.toastSuccess = vi.fn()
  shared.toastAlert = vi.fn()
  shared.translator = vi.fn<TranslatorFn>((key: string) => key)
  shared.relation = { table: 'hubify_collections' as TableNames, toKey: 'collection_id' }
  shared.getRelation = vi.fn(() => shared.relation)

  ;(globalThis as { $fetch?: typeof $fetch }).$fetch = shared.fetch

  vi.stubGlobal('useI18n', () => ({
    t: (...args: Parameters<TranslatorFn>) => shared.translator(...args)
  }))
})

// Global after each
afterEach(() => {
  ;(globalThis as { $fetch?: typeof $fetch }).$fetch = originalFetch
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

// Return global useStorageMap methods
export function getUseStorageMap() {
  if (!globalThis.__NUXT_COMPOSABLES_STORAGE__) {
    globalThis.__NUXT_COMPOSABLES_STORAGE__ = new Map()
  }
  return globalThis.__NUXT_COMPOSABLES_STORAGE__
}

export function getFetchMock() {
  return shared.fetch
}

export function getToastMocks() {
  return {
    success: shared.toastSuccess,
    alert: shared.toastAlert
  }
}

export function getTranslatorMock() {
  return shared.translator
}

export function getRelationMock() {
  return shared.getRelation
}

export function setRelationResult(relation: { table: TableNames, toKey: string }) {
  shared.relation = relation
}

export { }
