/// <reference types="@vitest/browser/providers/playwright" />
import { CollectionTable, DisplaysText } from '#components'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-vue'
import { computed, ref } from 'vue'
import { DEFAULT_PAGE_SIZE } from '~/composables/useQueryRouter'

const mockedCountries = (await import('./countries.mock.json')).default

vi.stubGlobal('useLocaleRoute', vi.fn(() => route => route))

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

const mockQueryLimit = ref(DEFAULT_PAGE_SIZE)
const mockQueryOffset = ref(0)

beforeEach(() => {
  mockQueryLimit.value = DEFAULT_PAGE_SIZE
  mockQueryOffset.value = 0
})

vi.mock('~/composables/useQueryRouter', () => {
  return {
    useQueryRouter: vi.fn(() => {
      return {
        queryLimit: mockQueryLimit,
        queryOffset: mockQueryOffset
      }
    })
  }
})

vi.mock('~/composables/useTable', () => {
  return {
    useTable: vi.fn(() => {
      const displayedColumns = computed(() => ['id', 'name', 'emoji', 'code'])

      return {
        primaryKey: 'id',
        columnNames: ['id', 'name', 'emoji', 'code'],
        getColumn: (key: string) => ({
          type: key === 'id' ? 'integer' : 'text'
        }),
        getPrimaryKeyValue: () => 'id',
        displayedColumns,
        getDisplayComponent: vi.fn(() => DisplaysText),
        getColumnLabel: vi.fn((column: string) => column)
      }
    })
  }
})

vi.mock('~/composables/useItems', () => {
  return {
    useItems: vi.fn((_collection, query) => {
      const fetchItems = vi.fn().mockResolvedValue(undefined)

      // Fake items returns based on query parameters
      const items = computed(() => {
        const limit = Number(query?.value?.limit ?? mockQueryLimit.value ?? 10)
        const offset = Number(query?.value?.offset ?? mockQueryOffset.value ?? 0)

        if (!Number.isFinite(limit) || limit <= 0) return []

        return mockedCountries.items.slice(offset, offset + limit)
      })

      const totalCount = computed(() => mockedCountries.total_count)

      return {
        getItems: () => ({
          items,
          total_count: totalCount,
          fetchItems
        }),
        deleteItems: vi.fn()
      }
    })
  }
})

describe('CollectionTable', () => {
  it('renders correctly', async () => {
    const screen = render(CollectionTable, {
      props: {
        collection: 'test' as TableNames
      }
    })

    mockQueryLimit.value = 10
    mockQueryOffset.value = 0

    // Render table
    const table = screen.getByTestId('collection-table')
    await expect.element(table).toBeVisible()
    const itemCell = screen.getByText('France')
    await expect.element(itemCell).toBeVisible()
    const tableRows = table.element().querySelectorAll('tbody > tr')
    expect(tableRows?.length).toEqual(mockQueryLimit.value)

    // Render title
    const collectionTitle = screen.getByTestId('collection-title')
    await expect.element(collectionTitle).toBeVisible()
    const titleText = collectionTitle.element().querySelector('h2')?.textContent
    expect(titleText?.toLowerCase()).toContain('test')
    expect(titleText).toContain(`${mockQueryLimit.value}/${mockedCountries.total_count} items`)

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
