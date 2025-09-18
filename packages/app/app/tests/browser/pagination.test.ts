/// <reference types="@vitest/browser/providers/playwright" />
import { CollectionTableFooter, CollectionTableHeader } from '#components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { page, type Locator } from '@vitest/browser/context'
import { describe, expect, it, vi } from 'vitest'
import 'vitest-browser-vue'
import { ref, type Ref } from 'vue'

let mockPageIndex: Ref<number>
let mockPageSize: Ref<number>
let queryOffset: Ref<number | undefined>
let queryLimit: Ref<number | undefined>

mockNuxtImport('useQueryRouter', () => {
  return () => {
    return {
      queryWhere: undefined
    }
  }
})

const updatePageIndex = vi.fn((p: number) => {
  mockPageIndex.value = p
  queryOffset.value = p * mockPageSize.value || undefined
})

const updatePageSize = vi.fn((p: number) => {
  mockPageSize.value = p
  queryLimit.value = p
})

vi.mock('~/composables/usePagination', () => ({
  usePagination: () => {
    mockPageIndex = mockPageIndex ?? ref(1)
    mockPageSize = mockPageSize ?? ref(10)
    queryOffset = ref(undefined)
    queryLimit = ref(undefined)
    return {
      pageIndex: mockPageIndex,
      pageSize: mockPageSize,
      updatePageIndex,
      updatePageSize
    }
  }
}))

describe('CollectionTableFooter ', () => {
  it('Renders corectly CollectionTableFooter', async () => {
    mockPageIndex = ref(1)
    mockPageSize = ref(10)

    page.render(CollectionTableFooter, {
      props: {
        collection: 'test' as TableNames,
        totalItems: 100,
        displayedItems: 10
      }
    })

    const pagination = page.getByTestId('table-pagination')
    await expect.element(pagination).toBeVisible()

    const paginationButtons = page.getByTag('button').all()

    expect(paginationButtons.length).toEqual(9) // 5 pages + 2 before and 2 after

    const firstPageButton = paginationButtons.find(b => b.element().ariaLabel === 'Page 1')

    expect(firstPageButton).toHaveAttribute('data-selected')

    const secondPageButton = paginationButtons.find(b => b.element().ariaLabel === 'Page 2')
    await secondPageButton?.click()
    expect(secondPageButton).toHaveAttribute('data-selected')

    const lastPageButton = paginationButtons[paginationButtons.length - 1]
    await lastPageButton?.click()

    const selectedButton = paginationButtons.find(b => b.element().getAttribute('data-selected') === 'true')
    expect(selectedButton?.element().ariaLabel).toEqual('Page 10') // 100 items / 10 pageSize
  })

  it('Update offset query correctly', async () => {
    mockPageIndex = ref(1)
    mockPageSize = ref(10)

    page.render(CollectionTableFooter, {
      props: {
        collection: 'test' as TableNames,
        totalItems: 100,
        displayedItems: 10
      }
    })

    const paginationButtons = page.getByTag('button').all()

    const page3Button = paginationButtons.find(b => b.element().ariaLabel === 'Page 3')
    await page3Button?.click()

    expect(updatePageIndex).toHaveBeenCalledWith(3)
    expect(queryOffset.value).toBe(30) // 3 * pageSize = 30

    const lastPageButton = paginationButtons[paginationButtons.length - 1]
    await lastPageButton?.click()
    expect(updatePageIndex).toHaveBeenLastCalledWith(10)
    expect(queryOffset.value).toBe(100) // 10 * pageSize = 100
  })
})

describe('CollectionTableHeader ', () => {
  it('Renders corectly CollectionTableHeader', async () => {
    mockPageIndex = ref(1)
    mockPageSize = ref(10)

    page.render(CollectionTableHeader, {
      props: {
        collection: 'test' as TableNames,
        totalCount: 100
      }
    })

    const pageSizeElement = page.getByTestId('table-page-size').getByTag('button')
    await expect(pageSizeElement).toBeVisible()

    expect(queryLimit.value).toBeUndefined()

    await selectOption(pageSizeElement, '20 items')
    expect(queryLimit.value).toBe(20)

    await selectOption(pageSizeElement, '50 items')
    expect(queryLimit.value).toBe(50)
  })
})

async function selectOption(selector: Locator, option: string) {
  await selector.click()

  const controls = selector.element().getAttribute('aria-controls')

  if (!controls) {
    throw new Error('aria-controls not found on selector')
  }

  const el = page.getById(controls).getByRole('group').getByText(option)

  await expect.element(el).toBeVisible()
  await el.click()
}
