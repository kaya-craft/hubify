import { beforeEach, describe, expect, it } from 'vitest'
import 'vitest-browser-vue'
import { CollectionFilterContent } from '#components'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { page, type Locator, userEvent } from '@vitest/browser/context'
import { get } from '@vueuse/core'

mockNuxtImport('useTable', () => () => ({
  primaryKey: 'id',
  columnNames: ['id', 'name'],
  getColumn: (key: string) => ({
    type: key === 'id' ? 'integer' : 'text'
  })
}))

describe('CollectionFilter', () => {
  it('renders correctly', async () => {
    let modelValue = {}

    const result = page.render(CollectionFilterContent, {
      props: {
        'collection': 'test' as TableNames,
        modelValue,
        'onUpdate:modelValue': (val) => {
          result.rerender({ modelValue: val })
          modelValue = val
        }
      }
    })

    const addFilterClause = page.getByTestId('add-filter-clause')
    const addFilterAnd = page.getByTestId('add-filter-and')
    const addFilterOr = page.getByTestId('add-filter-or')

    await expect.element(addFilterClause).toBeVisible()
    await expect.element(addFilterAnd).toBeVisible()
    await expect.element(addFilterOr).toBeVisible()

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

    await addFilterAnd.click()

    await expect.element(getClause(1)).toBeVisible()

    expect(modelValue).toMatchObject({
      $and: [
        { id: { $eq: null } },
        { $and: [] }
      ]
    })

    await addFilterOr.click()

    await expect.element(getClause(2)).toBeVisible()

    expect(modelValue).toMatchObject({
      $and: [
        { id: { $eq: null } },
        { $and: [] },
        { $or: [] }
      ]
    })

    const event = new MouseEvent('mousedown', {
      bubbles: true
    })

    getClause(0).element().dispatchEvent(event)

    await getClause(0).dropTo(getClause(1).getByTestId('filter-clauses'), {
      force: true,
      targetPosition: {
        x: 100,
        y: 100
      }
    })

    // const operatorOptions = await getDropdownOptions(getOperator(0))

    // await expect(operatorOptions).toMatchObject(expect.arrayContaining([
    //   'app.admin.filters.$eq',
    //   'app.admin.filters.$neq',
    //   'app.admin.filters.$lt',
    //   'app.admin.filters.$lte',
    //   'app.admin.filters.$gt',
    //   'app.admin.filters.$gte',
    //   'app.admin.filters.$null',
    //   'app.admin.filters.$nnull',
    //   'app.admin.filters.$in',
    //   'app.admin.filters.$nin',
    //   'app.admin.filters.$between',
    //   'app.admin.filters.$nbetween'
    // ]))

    // const columnOptions = await getDropdownOptions(getColumn(0))

    // await expect(columnOptions).toMatchObject(expect.arrayContaining([
    //   'id',
    //   'name'
    // ]))
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
