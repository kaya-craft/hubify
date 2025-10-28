import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'

const hoisted = vi.hoisted(() => ({
  fetchData: null as unknown as Ref<{ items: TableItem<'hubify_collections'>[], total_count: number }>,
  refresh: vi.fn(),
  hookHandlers: [] as Array<{ name: string, handler: (payload: { collection: TableNames }) => void }>
}))

mockNuxtImport('useFetch', () => {
  return <T>() => ({
    data: hoisted.fetchData as unknown as Ref<T>,
    refresh: hoisted.refresh
  })
})

mockNuxtImport('onHubifyHook', () => {
  return (name: string, handler: (payload: { collection: TableNames }) => void) => {
    hoisted.hookHandlers.push({ name, handler })
  }
})

function createCollection(overrides: Partial<TableItem<'hubify_collections'>> = {}) {
  return {
    id: 1,
    name: 'countries',
    displayTemplate: '{{name}} - {{code}}',
    ...overrides
  } as TableItem<'hubify_collections'>
}

async function useCollectionsComposable() {
  const { useCollections } = await import('../../composables/useCollections')
  return useCollections()
}

beforeEach(() => {
  vi.resetModules()
  hoisted.fetchData = ref({
    items: [],
    total_count: 0
  }) as Ref<{ items: TableItem<'hubify_collections'>[], total_count: number }>
  hoisted.refresh = vi.fn()
  hoisted.hookHandlers.length = 0
})

afterEach(() => {
  vi.clearAllMocks()
})

describe.skip('useCollections', () => {
  it('returns collections ref from useFetch', async () => {
    const collection = createCollection()
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { collections } = await useCollectionsComposable()

    expect(collections).toBe(hoisted.fetchData)
  })

  it('extracts display columns from template placeholders', async () => {
    const collection = createCollection({ displayTemplate: '{{name}}({{code}})' })
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { extractDisplayColumns } = await useCollectionsComposable()

    expect(extractDisplayColumns('countries' as TableNames)).toEqual(['name', 'code'])
  })

  it('returns undefined when collection has no display template', async () => {
    const collection = createCollection({ displayTemplate: undefined as unknown as string })
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { extractDisplayColumns } = await useCollectionsComposable()

    expect(extractDisplayColumns('countries' as TableNames)).toBeUndefined()
  })

  it('formats display string using template variables', async () => {
    const collection = createCollection({ displayTemplate: '{{name}} - {{code}}' })
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { getDisplay } = await useCollectionsComposable()

    const item = { name: 'France', code: 'FR' } as TableItem<'countries'>
    expect(getDisplay('countries' as TableNames, item)).toBe('France - FR')
  })

  it('returns undefined display when template missing variables', async () => {
    const collection = createCollection({ displayTemplate: 'Just text' })
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { getDisplay } = await useCollectionsComposable()

    const item = { name: 'France', code: 'FR' } as TableItem<'countries'>
    expect(getDisplay('countries' as TableNames, item)).toBeUndefined()
  })

  it('returns collection meta for requested table', async () => {
    const collection = createCollection({ id: 42 })
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    const { getCollectionMeta } = await useCollectionsComposable()

    expect(getCollectionMeta('countries' as TableNames)).toEqual(collection)
  })

  it('refreshes collections when hubify collections hook fires', async () => {
    const collection = createCollection()
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    await useCollectionsComposable()

    expect(hoisted.hookHandlers).toHaveLength(1)

    const handler = hoisted.hookHandlers[0]
    expect(handler.name).toBe('items')

    handler.handler({ collection: 'hubify_collections' as TableNames })
    expect(hoisted.refresh).toHaveBeenCalledTimes(1)
  })

  it('ignores hubify hooks for other collections', async () => {
    const collection = createCollection()
    hoisted.fetchData.value = { items: [collection], total_count: 1 }

    await useCollectionsComposable()

    const handler = hoisted.hookHandlers[0]
    hoisted.refresh.mockReset()

    handler.handler({ collection: 'countries' as TableNames })
    expect(hoisted.refresh).not.toHaveBeenCalled()
  })
})
