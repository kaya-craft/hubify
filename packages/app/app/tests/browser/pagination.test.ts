/// <reference types="@vitest/browser/providers/playwright" />
import { CollectionTableFooter, CollectionTableHeader } from '#components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { page, type Locator } from '@vitest/browser/context'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import 'vitest-browser-vue'
import { ref, type Ref } from 'vue'

const pagination = ref({
  pageIndex: 1,
  pageSize: 10
})
const queryOffset: Ref<number | undefined> = ref()
const queryLimit: Ref<number | undefined> = ref()

beforeEach(() => {
  pagination.value.pageIndex = 1
  pagination.value.pageSize = 10
  queryLimit.value = undefined
  queryOffset.value = undefined
})

mockNuxtImport('useQueryRouter', () => {
  return () => {
    return {
      queryWhere: undefined
    }
  }
})

const updatePageIndex = vi.fn((newPageIndex: number) => {
  pagination.value.pageIndex = newPageIndex
  queryOffset.value = (newPageIndex - 1) * pagination.value.pageSize
})

const updatePageSize = vi.fn((newPageSize: number) => {
  pagination.value.pageSize = newPageSize
  queryLimit.value = newPageSize
  const index = Math.max((Math.ceil((queryOffset.value ?? 0) / (newPageSize ?? 10)) + 1), 1)
  updatePageIndex(index)
})

mockNuxtImport('usePagination', () => {
  return () => {
    updatePageIndex(pagination.value.pageIndex)
    updatePageSize(pagination.value.pageSize)
    return {
      pagination,
      updatePageIndex,
      updatePageSize
    }
  }
})

describe('CollectionTableFooter ', () => {
  it('Renders corectly CollectionTableFooter', async () => {
    page.render(CollectionTableFooter, {
      props: {
        collection: 'test' as TableNames,
        totalItems: 100,
        displayedItems: 10
      }
    })

    /**
     * query parameters should equal pagination
     */
    expect(queryLimit.value).toEqual(10)
    expect(queryOffset.value).toEqual(0)

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
    expect(queryOffset.value).toBe(20) // (3 - 1) * pageSize = 20

    const lastPageButton = paginationButtons[paginationButtons.length - 1]
    await lastPageButton?.click()
    expect(updatePageIndex).toHaveBeenLastCalledWith(10)
    expect(queryOffset.value).toBe(90) // 10 * pageSize = 100
  })
})

describe('CollectionTableHeader ', () => {
  it('Renders corectly CollectionTableHeader', async () => {
    page.render(CollectionTableHeader, {
      props: {
        collection: 'test' as TableNames,
        totalCount: 100
      }
    })

    const pageSizeElement = page.getByTestId('table-page-size').getByTag('button')
    await expect(pageSizeElement).toBeVisible()

    expect(queryLimit.value).toBe(10)

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
