import { CollectionTable, DisplaysText } from '#components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useQueryRouter'
import { page } from 'vitest/browser'

const mockedCountries = (await import('./countries.mock.json')).default

vi.stubGlobal('useI18n', () => ({
  t: (value: string, params: Record<string, unknown>) => {
    if (value === 'app.admin.items-number') {
      return '{displayedItems}/{totalItems} items'
        .replace('{displayedItems}', (params as { displayedItems: string, totalItems: string }).displayedItems)
        .replace('{totalItems}', (params as { displayedItems: string, totalItems: string }).totalItems)
    }
    return value
  }
}))

afterAll(() => {
  vi.unstubAllGlobals()
})

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})
const queryOffset: Ref<number | undefined> = ref()
const queryLimit: Ref<number | undefined> = ref()

beforeEach(() => {
  pagination.value.pageIndex = 1
  pagination.value.pageSize = DEFAULT_PAGE_SIZE
  queryLimit.value = undefined
  queryOffset.value = undefined
})

mockNuxtImport('useQueryRouter', () => {
  return () => {
    return {
      queryLimit,
      queryOffset
    }
  }
})

mockNuxtImport('useTable', () => {
  return () => {
    return {
      primaryKey: 'id',
      columnNames: ['id', 'name', 'emoji', 'code'],
      getColumn: (key: string) => ({
        type: key === 'id' ? 'integer' : 'text'
      }),
      getPrimaryKeyValue: () => 'id',
      displayedColumns: computed(() => ['id', 'name', 'emoji', 'code']),
      getDisplayComponent: () => DisplaysText,
      getColumnLabel: (column: string) => column
    }
  }
})

mockNuxtImport('useItems', () => {
  return () => {
    const items = computed(() => {
      const limit = Number(queryLimit.value ?? 10)
      const offset = Number(queryOffset.value ?? 0)

      if (!Number.isFinite(limit) || limit <= 0) return []

      return mockedCountries.items.slice(offset, offset + limit)
    })

    const totalCount = computed(() => mockedCountries.total_count)

    return {
      refresh: vi.fn(),
      data: computed(() => ({
        items: items.value,
        total_count: totalCount.value
      }))
    }
  }
})

mockNuxtImport('useCollection', () => {
  return () => {
    return {
      remove: vi.fn()
    }
  }
})

describe('CollectionTable', () => {
  it('renders correctly', async () => {
    const screen = page.render(CollectionTable, {
      props: {
        collection: 'test' as TableNames
      }
    })

    // Render table
    const table = screen.getByTestId('collection-table')
    await expect.element(table).toBeVisible()
    const itemCell = screen.getByText('France')
    await expect.element(itemCell).toBeVisible()
    const tableRows = table.element().querySelectorAll('tbody > tr')
    expect(tableRows?.length).toEqual(queryLimit.value)

    // Render Page size button
    const pageSizeButton = screen.getByTestId('table-page-size')
    await expect.element(pageSizeButton).toBeVisible()

    // Render Column visibility button
    const columnVisibilityButton = screen.getByTestId('table-column-visibility')
    await expect.element(columnVisibilityButton).toBeVisible()

    // Render Column visibility button
    const deleteButton = screen.getByTestId('table-delete-button')
    await expect.element(deleteButton).toBeVisible()

    // Render pagination
    const paginationEl = screen.getByTestId('table-pagination')
    await expect.element(paginationEl).toBeVisible()
  })
})
