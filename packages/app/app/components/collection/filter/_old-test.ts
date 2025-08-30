import { describe, it, expect } from 'vitest'
import { CollectionFilterContent } from '#components'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import type { SelectProps } from '@nuxt/ui'

mockNuxtImport('useI18n', () => () => ({ t: (key: string) => key }))

mockNuxtImport('useTable', () => () => ({
  primaryKey: 'id',
  columnNames: ['id', 'name'],
  getColumn: (key: string) => ({
    type: key === 'id' ? 'integer' : 'text'
  })
}))

describe('CollectionFilter', () => {
  it('renders correctly', async () => {
    const wrapper = await createWrapper()

    await addFilterClause(wrapper)

    /**
     * Ensure the select column options are correct
     */
    expect(getSelectProps(wrapper, 'filter-column').items).toMatchObject([{
      label: 'id',
      value: 'id'
    }, {
      label: 'name',
      value: 'name'
    }])

    /**
     * Ensure the default selected column is the primary key
     */
    expect(getSelectProps(wrapper, 'filter-column').modelValue).toBe('id')

    /**
     * Ensure the select operator options are correct
     */
    expect(getSelectProps(wrapper, 'filter-operator').items).toMatchObject(expect.arrayContaining([{
      label: 'app.admin.filters.$eq',
      value: '$eq'
    }, {
      label: 'app.admin.filters.$neq',
      value: '$neq'
    }, {
      label: 'app.admin.filters.$gt',
      value: '$gt'
    }, {
      label: 'app.admin.filters.$lt',
      value: '$lt'
    }, {
      label: 'app.admin.filters.$gte',
      value: '$gte'
    }, {
      label: 'app.admin.filters.$lte',
      value: '$lte'
    }, {
      label: 'app.admin.filters.$null',
      value: '$null'
    }, {
      label: 'app.admin.filters.$nnull',
      value: '$nnull'
    }, {
      label: 'app.admin.filters.$in',
      value: '$in'
    }, {
      label: 'app.admin.filters.$nin',
      value: '$nin'
    }, {
      label: 'app.admin.filters.$between',
      value: '$between'
    }, {
      label: 'app.admin.filters.$nbetween',
      value: '$nbetween'
    }]))

    /**
     * Ensure the default model value is correct
     */
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          id: {
            $eq: null
          }
        }
      ]
    })

    await setValue(wrapper, 1)
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          id: {
            $eq: 1
          }
        }
      ]
    })

    await setColumn(wrapper, 'name')
    await setValue(wrapper, 'test')
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          name: {
            $eq: 'test'
          }
        }
      ]
    })

    await setOperator(wrapper, '$neq')
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          name: {
            $neq: 'test'
          }
        }
      ]
    })

    await addFilterClause(wrapper)
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          name: {
            $neq: 'test'
          }
        },
        {
          id: {
            $eq: null
          }
        }
      ]
    })

    await setValue(wrapper, 1, '1')
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          name: {
            $neq: 'test'
          }
        },
        {
          id: {
            $eq: 1
          }
        }
      ]
    })

    await addAndClause(wrapper)
    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          name: {
            $neq: 'test'
          }
        },
        {
          id: {
            $eq: 1
          }
        },
        {
          $and: []
        }
      ]
    })

    const dragHandle = getDragHandle(wrapper)

    dragAfter(dragHandle, getClause(wrapper, '1'))

    expect(wrapper.props().modelValue).toMatchObject({
      $and: [
        {
          id: {
            $eq: null
          }
        },
        {
          name: {
            $neq: 'test'
          }
        },
        {
          $and: []
        }
      ]
    })
  })
})

type WrapperFilter = Awaited<ReturnType<typeof createWrapper>>

async function createWrapper() {
  const wrapper = await mountSuspended(CollectionFilterContent, {
    props: {
      'collection': 'test' as TableNames,
      'modelValue': {},
      'onUpdate:modelValue': val => wrapper.setProps({ modelValue: val })
    }
  })

  return wrapper
}

function addFilterClause(wrapper: WrapperFilter) {
  return wrapper.get('[data-testid="add-filter-clause"]').trigger('click')
}

function addAndClause(wrapper: WrapperFilter) {
  return wrapper.get('[data-testid="add-filter-and"]').trigger('click')
}

function addOrClause(wrapper: WrapperFilter) {
  return wrapper.get('[data-testid="add-filter-or"]').trigger('click')
}

function setColumn(wrapper: WrapperFilter, value: string, clauseId = '0') {
  return getSelectComponent(wrapper, 'filter-column', clauseId).setValue(value)
}

function setOperator(wrapper: WrapperFilter, value: string, clauseId = '0') {
  return getSelectComponent(wrapper, 'filter-operator', clauseId).setValue(value)
}

function setValue(wrapper: WrapperFilter, value: string | number, clauseId = '0') {
  return getClause(wrapper, clauseId).findComponent(':has(>[data-testid="filter-value"])').setValue(value)
}

function getDragHandle(wrapper: WrapperFilter, clauseId = '0') {
  return getClause(wrapper, clauseId).get('[data-testid="drag-handle"]')
}

function dragAfter(dragHandle: ReturnType<WrapperFilter['get']>, targetClause: ReturnType<WrapperFilter['get']>) {
  // Simulate drag start event
  dragHandle.trigger('dragstart', {
    clientX: 0,
    clientY: 0
  })

  // Simulate drag over event on the target clause
  targetClause.trigger('dragover')

  // Simulate drop event on the target clause
  targetClause.trigger('drop')

  // Simulate drag end event
  dragHandle.trigger('dragend')
}

function getClause(wrapper: WrapperFilter, clauseId = '0') {
  return clauseId.split('-').reduce((acc, curr) => {
    return acc.get(`[data-testid="filter-clause-${curr}"]`)
  }, wrapper.get('[data-testid="filter-clauses"]'))
}

function getSelectComponent(wrapper: WrapperFilter, testId: string, clauseId = '0') {
  const component = getClause(wrapper, clauseId).findAllComponents({ name: 'USelect' }).find((wrapper) => {
    return wrapper.html().includes(`data-testid="${testId}"`)
  })

  if (!component) throw new Error(`Select component with testId "${testId}" not found`)

  return component
}

function getSelectProps(wrapper: WrapperFilter, testId: string, clauseId = '0') {
  return getSelectComponent(wrapper, testId, clauseId).props() as SelectProps
}
