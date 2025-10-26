import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { getUseStorageMap } from './setup'

const collectionKey = 'test'

const hoisted = vi.hoisted(() => ({
  queryLimit: undefined as unknown as Ref<number | undefined>,
  queryOffset: undefined as unknown as Ref<number | undefined>
}))

mockNuxtImport('useQueryRouter', () => {
  return () => ({
    queryLimit: hoisted.queryLimit,
    queryOffset: hoisted.queryOffset
  })
})

function storageKey(name: string) {
  return `hubify.collection.${name}.limit`
}

async function createPagination() {
  const { usePagination } = await import('../../composables/usePagination')
  return usePagination(collectionKey as TableNames)
}

beforeEach(() => {
  hoisted.queryLimit = ref<number | undefined>()
  hoisted.queryOffset = ref<number | undefined>()
})

describe('usePagination', () => {
  it('initializes pagination with defaults and syncs query params', async () => {
    const { pagination } = await createPagination()

    expect(pagination.value.pageIndex).toBe(1)
    expect(pagination.value.pageSize).toBe(10)
    expect(hoisted.queryOffset.value).toBe(0)
    expect(hoisted.queryLimit.value).toBe(10)
    expect(getUseStorageMap().get(storageKey(collectionKey))?.value).toBe(10)
  })

  it('updates query offset when page index changes', async () => {
    const { pagination, updatePageIndex } = await createPagination()

    updatePageIndex(3)

    expect(pagination.value.pageIndex).toBe(3)
    expect(hoisted.queryOffset.value).toBe(20)
  })

  it('persists page size changes and recalculates index', async () => {
    const { pagination, updatePageIndex, updatePageSize } = await createPagination()

    updatePageIndex(5)
    expect(hoisted.queryOffset.value).toBe(40)

    updatePageSize(20)

    expect(pagination.value.pageSize).toBe(20)
    expect(hoisted.queryLimit.value).toBe(20)
    expect(getUseStorageMap().get(storageKey(collectionKey))?.value).toBe(20)
    expect(pagination.value.pageIndex).toBe(3)
    expect(hoisted.queryOffset.value).toBe(40)
  })

  it('uses persisted page size from local storage', async () => {
    getUseStorageMap().set(storageKey(collectionKey), ref(25))

    const { pagination } = await createPagination()

    expect(pagination.value.pageSize).toBe(25)
    expect(hoisted.queryLimit.value).toBe(25)
  })
})
