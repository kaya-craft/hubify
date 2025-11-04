import { CollectionTable } from '#components'
import { page } from '@vitest/browser/context'
import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_SIZE } from '@/composables/useQueryRouter'

describe('CollectionTable', () => {
  it('renders correctly', async () => {
    const screen = page.render(CollectionTable, {
      props: {
        collection: 'countries' as TableNames
      }
    })

    // Render table
    const table = screen.getByTestId('collection-table')
    await expect.element(table).toBeVisible()
    const itemCell = screen.getByText('France')
    await expect.element(itemCell).toBeVisible()
    const tableRows = table.element().querySelectorAll('tbody > tr')
    expect(tableRows?.length).toEqual(DEFAULT_PAGE_SIZE)

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
