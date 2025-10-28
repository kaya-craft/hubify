import { CollectionTableFooter, CollectionTableHeader } from '#components'
import { page, type Locator } from '@vitest/browser/context'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Pagination ', () => {
  beforeEach(async () => {
    await useRouter().replace({ query: {} })
  })

  it('Renders corectly CollectionTableFooter', async () => {
    page.render(CollectionTableFooter, {
      props: {
        collection: 'countries',
        totalItems: 100,
        displayedItems: 10
      }
    })

    const pagination = page.getByTestId('table-pagination')
    await expect.element(pagination).toBeVisible()

    const paginationButtons = page.getByTag('button').all()

    expect(paginationButtons.length).toEqual(5 + 4) // +4 for next, prev, first, last buttons

    const firstPageButton = paginationButtons.find(b => b.element().ariaLabel === 'Page 1')

    expect(firstPageButton).toHaveAttribute('data-selected')

    const secondPageButton = paginationButtons.find(b => b.element().ariaLabel === 'Page 2')
    await secondPageButton?.click()
    expect(secondPageButton).toHaveAttribute('data-selected')

    const lastPageButton = paginationButtons[paginationButtons.length - 1]
    await lastPageButton?.click()

    const selectedButton = paginationButtons.find(b => b.element().getAttribute('data-selected') === 'true')
    expect(selectedButton?.element().ariaLabel).toEqual('Page ' + 10) // 100 items / 10 pageSize
  })

  it('Update offset query correctly', async () => {
    page.render(CollectionTableFooter, {
      props: {
        collection: 'countries',
        totalItems: 100,
        displayedItems: 10
      }
    })

    const route = useRoute()

    const paginationButtons = page.getByTag('button').all()

    const page2Button = paginationButtons.find(b => b.element().ariaLabel === 'Page 2')
    if (!page2Button) throw new Error('Page 2 button not found')

    await page2Button.click()
    await waitForRouteUpdate()
    expect(route.query.offset).toBe('10')

    const lastPageButton = paginationButtons[paginationButtons.length - 1]
    await lastPageButton?.click()
    await waitForRouteUpdate()
    expect(route.query.offset).toBe('90')
  })

  it('Renders corectly CollectionTableHeader', async () => {
    page.render(CollectionTableHeader, {
      props: {
        collection: 'countries',
        totalCount: 100,
        displayedItems: 10
      }
    })

    const route = useRoute()

    const pageSizeElement = page.getByTestId('table-page-size').getByTag('button')
    await expect(pageSizeElement).toBeVisible()
    expect(route.query.limit).toBeUndefined()

    selectOption(pageSizeElement, '20 items')
    await waitForRouteUpdate()
    expect(route.query.limit).toBe('20')
  })
})

/**
 * Select option from a dropdown
 */
async function selectOption(selector: Locator, option: string) {
  await selector.click()

  const controls = selector.element().getAttribute('aria-controls')

  if (!controls) {
    throw new Error('aria-controls not found on selector')
  }

  console.log(controls)

  const el = page.getById(controls).getByRole('group').getByText(option)

  await expect.element(el).toBeVisible()
  await el.click()
}

/**
 * Wait for next route update
 */
async function waitForRouteUpdate() {
  const route = useRouter().currentRoute
  return new Promise(resolve => watch(route, resolve, { once: true }))
}
