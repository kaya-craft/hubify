/// <reference types="@vitest/browser/providers/playwright" />
import { describe, expect, it } from 'vitest'
import 'vitest-browser-vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { page, userEvent, type Locator } from '@vitest/browser/context'
import { CollectionFilterContent } from '#components'

mockNuxtImport('useTable', () => () => ({
  primaryKey: 'id',
  columnNames: ['id', 'name'],
  getColumn: (key: string) => ({
    type: key === 'id' ? 'integer' : 'text'
  })
}))

describe('CollectionFilter', () => {
  it('renders correctly', async () => {
    let modelValue: undefined | {} = {}

    const result = page.render(CollectionFilterContent, {
      props: {
        'collection': 'test' as TableNames,
        modelValue,
        'onUpdate:modelValue': (val) => {
          if (JSON.stringify(val) === JSON.stringify(modelValue)) return
          result.rerender({ modelValue: val })
          modelValue = val
        }
      }
    })

    const filterOptions = page.getByTestId('filter-options')

    await expect.element(filterOptions).toBeVisible()
    await filterOptions.click()

    const addFilterClause = page.getByText('app.admin.filters.add-condition')
    const addFilterAnd = page.getByText('app.admin.filters.add-group')

    await expect.element(addFilterClause).toBeVisible()
    await expect.element(addFilterAnd).toBeVisible()

    await addFilterClause.click()

    await expect.element(getClause(0)).toBeVisible()
    await expect.element(getColumn(0)).toBeVisible()
    await expect.element(getOperator(0)).toBeVisible()
    await expect.element(getValue(0)).toBeVisible()

    expect(modelValue).toMatchObject({
      $and: [{
        id: { $eq: null }
      }]
    })

    const columnOptions = await getDropdownOptions(getColumn(0))
    expect(columnOptions).toEqual(['id', 'name'])

    expect(await getDropdownOptions(getOperator(0))).toMatchObject(expect.arrayContaining([
      'app.admin.filters.$eq',
      'app.admin.filters.$neq',
      'app.admin.filters.$gt',
      'app.admin.filters.$gte',
      'app.admin.filters.$lt',
      'app.admin.filters.$lte',
      'app.admin.filters.$in',
      'app.admin.filters.$nin',
      'app.admin.filters.$null',
      'app.admin.filters.$nnull',
      'app.admin.filters.$between',
      'app.admin.filters.$nbetween'
    ]))

    await selectOption(getColumn(0), 'name')

    expect(modelValue).toMatchObject({
      $and: [{
        name: { $eq: null }
      }]
    })

    expect(await getDropdownOptions(getOperator(0))).toMatchObject(expect.arrayContaining([
      'app.admin.filters.$eq',
      'app.admin.filters.$neq',
      'app.admin.filters.$null',
      'app.admin.filters.$nnull',
      'app.admin.filters.$contains',
      'app.admin.filters.$ncontains',
      'app.admin.filters.$startsWith',
      'app.admin.filters.$endsWith',
      'app.admin.filters.$in',
      'app.admin.filters.$nin',
      'app.admin.filters.$nstartsWith',
      'app.admin.filters.$nendsWith'
    ]))

    await selectOption(getOperator(0), 'app.admin.filters.$contains')

    expect(modelValue).toMatchObject({
      $and: [{
        name: { $contains: null }
      }]
    })

    await getValue(0).fill('test')

    expect(modelValue).toMatchObject({
      $and: [{
        name: { $contains: 'test' }
      }]
    })

    await filterOptions.click()
    await addFilterAnd.click()

    userEvent.keyboard('{Escape}')

    await expect.element(getClause(1)).toBeVisible()

    expect(modelValue).toMatchObject({
      $and: [
        { name: { $contains: 'test' } },
        { $and: [] }
      ]
    })

    const dragHandle = getClause(0).getByTestId('drag-handle')
    await expect.element(dragHandle).toBeInTheDocument()

    const dropHere = getClause(1).getByTestId('filter-drop-here')
    await expect.element(dropHere).toBeVisible()

    await dragHandle.hover()
    await dragHandle.dropTo(dropHere, { force: true, targetPosition: { x: 10, y: 10 } })

    expect(modelValue).toMatchObject({
      $and: [
        { $and: [{ name: { $contains: 'test' } }] }
      ]
    })

    const copyGroup = getClause(0).getByTestId('copy-group')
    await expect.element(copyGroup).toBeVisible()
    await copyGroup.click()

    expect(modelValue).toMatchObject({
      $and: [
        { $and: [{ name: { $contains: 'test' } }] },
        { $and: [{ name: { $contains: 'test' } }] }
      ]
    })

    const removeClause = getClause(0, 0).getByTestId('remove-clause')
    await expect.element(removeClause).toBeVisible()
    await removeClause.click()

    expect(modelValue).toMatchObject({
      $and: [
        { $and: [] },
        { $and: [{ name: { $contains: 'test' } }] }
      ]
    })

    const removeGroup = getClause(1).getByTestId('remove-group')
    await expect.element(removeGroup).toBeVisible()
    await removeGroup.click()

    expect(modelValue).toMatchObject({
      $and: [{ $and: [] }]
    })
  })
})

function getClause(...clausePaths: number[]) {
  return clausePaths.reduce((el, path) => {
    return el.getByTestId(`filter-clause-${path}`)
  }, page.getByTestId('filter-clauses'))
}

function getColumn(...clausePaths: number[]) {
  return getClause(...clausePaths).getByTestId('filter-column')
}

function getOperator(...clausePaths: number[]) {
  return getClause(...clausePaths).getByTestId('filter-operator')
}

function getValue(...clausePaths: number[]) {
  return getClause(...clausePaths).getByTestId('filter-value')
}

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

async function getDropdownOptions(selector: Locator) {
  await selector.click()

  const controls = selector.element().getAttribute('aria-controls')

  if (!controls) {
    throw new Error('aria-controls not found on selector')
  }

  const el = page.getById(controls).getByRole('group').element()

  const values = Array.from(el.children).map(i => i.textContent)

  await userEvent.keyboard('{Escape}')

  return values
}
