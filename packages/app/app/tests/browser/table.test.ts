/// <reference types="@vitest/browser/providers/playwright" />
import { CollectionTable } from '#components'
import { page } from '@vitest/browser/context'
import { describe, expect, it, vi } from 'vitest'
import 'vitest-browser-vue'
import { Suspense, computed, defineComponent, h, ref, unref } from 'vue'

const StubUApp = defineComponent({
  name: 'StubUApp',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'u-app' }, slots.default?.())
  }
})

const StubUDashboardGroup = defineComponent({
  name: 'StubUDashboardGroup',
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'dashboard-group' }, slots.default?.())
  }
})

const StubUDashboardPanel = defineComponent({
  name: 'StubUDashboardPanel',
  setup(_, { slots }) {
    return () => h('section', { 'data-testid': 'dashboard-panel' }, [
      slots.header?.(),
      slots.default?.(),
      slots.body?.(),
      slots.footer?.()
    ])
  }
})

const StubCollectionTableHeader = defineComponent({
  name: 'StubCollectionTableHeader',
  props: {
    collection: { type: String, required: true }
  },
  emits: ['delete-items', 'update:page-size', 'update:query-where', 'update:global-filter'],
  setup(props, { slots }) {
    return () => h('header', { 'data-testid': 'table-header' }, slots.default?.() ?? props.collection)
  }
})

const StubCollectionTableFooter = defineComponent({
  name: 'StubCollectionTableFooter',
  props: {
    totalCount: { type: [Number, Object], required: true }
  },
  setup(props) {
    return () => h('div', { 'data-testid': 'table-pagination' }, `Total: ${unref(props.totalCount)}`)
  }
})

const StubCollectionTableActions = defineComponent({
  name: 'StubCollectionTableActions',
  setup() {
    return () => h('div', { 'data-testid': 'table-actions' })
  }
})

const StubCollectionFilter = defineComponent({
  name: 'StubCollectionFilter',
  props: {
    collection: { type: String, required: true }
  },
  emits: ['update:modelValue'],
  setup(_, { slots }) {
    return () => h('div', { 'data-testid': 'collection-filter' }, slots.default?.())
  }
})

const StubUTable = defineComponent({
  name: 'StubUTable',
  props: {
    data: { type: Array, default: () => [] }
  },
  setup(props) {
    return () => h('div', { 'data-testid': 'table-data' }, JSON.stringify(props.data))
  }
})

vi.mock('#components', async () => {
  const actual = await vi.importActual<typeof import('#components')>('#components')
  return {
    ...actual,
    UApp: StubUApp,
    UDashboardGroup: StubUDashboardGroup,
    UDashboardPanel: StubUDashboardPanel,
    UTable: StubUTable,
    CollectionTableHeader: StubCollectionTableHeader,
    CollectionTableFooter: StubCollectionTableFooter,
    CollectionTableActions: StubCollectionTableActions,
    CollectionFilter: StubCollectionFilter
  }
})

const Host = defineComponent({
  name: 'HostComponent',
  setup() {
    return () => h(
      Suspense,
      null,
      {
        default: () => h(
          StubUApp,
          null,
          {
            default: () => h(
              StubUDashboardGroup,
              null,
              {
                default: () => h(CollectionTable, { collection: 'test' as TableNames, selectable: true })
              }
            )
          }
        ),
        fallback: () => h('div', { 'data-testid': 'table-loading' }, 'Loading')
      }
    )
  }
})

vi.stubGlobal('RouterLink', defineComponent({
  name: 'RouterLinkStub',
  props: {
    to: { type: [String, Object], default: '#' }
  },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : '#' }, slots.default?.())
  }
}))

vi.stubGlobal('NuxtLink', defineComponent({
  name: 'NuxtLinkStub',
  props: {
    to: { type: [String, Object], default: '#' }
  },
  setup(props, { slots }) {
    return () => h('a', { href: typeof props.to === 'string' ? props.to : '#' }, slots.default?.())
  }
}))

// Minimal global
vi.stubGlobal('onHubifyHook', vi.fn())

// Minimal mocks required by CollectionTable
vi.mock('~/composables/useTable', () => ({
  useTable: () => ({
    displayedColumns: ['id', 'name'],
    getDisplayComponent: () => defineComponent({
      props: { value: { type: [String, Number, Object, Array, Boolean, null], default: '' } },
      setup(props) {
        return () => h('span', props.value as unknown)
      }
    }),
    getColumnLabel: (n: string) => n
  })
}))

const mockItems = ref([{ id: 1, name: 'Item 1' }])
const mockRefreshItems = vi.fn()
const mockDeleteItems = vi.fn()

vi.mock('~/composables/useItems', () => ({
  useItems: () => ({
    getItems: async () => ({
      items: computed(() => mockItems.value),
      total_count: computed(() => mockItems.value.length),
      refresh: mockRefreshItems,
      status: 'success' as const
    }),
    deleteItems: mockDeleteItems
  })
}))

vi.mock('~/composables/useQueryRouter', () => ({
  useQueryRouter: () => ({
    queryWhere: ref(),
    validatedWhere: ref(),
    queryOffset: ref<number | undefined>(undefined),
    queryOrderBy: ref<string | undefined>(undefined)
  })
}))

vi.mock('~/composables/usePagination', () => ({
  usePagination: () => ({
    pagination: ref({ pageIndex: 1, pageSize: 10 }),
    pageSize: ref(10),
    pageIndex: ref(1),
    updatePageIndex: vi.fn(),
    updatePageSize: vi.fn()
  })
}))

vi.mock('~/composables/useCollections', () => ({
  useCollections: () => ({ getCollectionMeta: () => ({ color: '#000', icon: 'i-any' }) })
}))

describe('CollectionTable', () => {
  it('renders the collection table with data', async () => {
    mockItems.value = [{ id: 1, name: 'Item 1' }]
    mockRefreshItems.mockClear()
    mockDeleteItems.mockClear()

    await page.render(Host)

    const header = page.getByTestId('table-header')
    await expect.element(header).toBeVisible()
    await expect.element(header).toHaveText('test')

    const tablePagination = page.getByTestId('table-pagination')
    await expect.element(tablePagination).toBeVisible()
    await expect.element(tablePagination).toHaveText('Total: 1')
  })
})
