<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions, UButton, UCheckbox } from '#components'
import type { QueryParams } from '@hubify/restql'
import type { TableColumn } from '@nuxt/ui'
import type { ColumnSort, Row, Table } from '@tanstack/vue-table'

type Props = {
  collection: T
  queryRouter?: QueryParams<Schema, T>
  selectable?: boolean
}

const { selectable, collection, queryRouter } = defineProps<Props>()

/**
 * Collection definition.
 */
const { displayedColumns, getDisplayComponent, getColumnLabel } = useTable(collection)

/**
 * List of collection columns.
 */
const collectionColumns = computed(() => {
  return toValue(displayedColumns).map(name => ({
    id: name,
    accessorKey: name,
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: getColumnLabel(name),
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => {
          queryOrderBy.value = (column.getIsSorted() === 'asc' ? `-${name}` : name) as unknown as QueryParams<Schema, T>['orderBy']
          return column.toggleSorting(column.getIsSorted() === 'asc')
        }
      })
    },
    cell: ({ row }) => {
      const value = row.original[name as keyof typeof row.original]
      const component = getDisplayComponent(name)
      return h(component, { value })
    }
  }) satisfies TableColumn<TableItem<T>>)
    .filter(isNonNullish)
})

/**
 * List of action columns.
 */
const actionColumns = [{
  id: 'actions',
  accessorKey: '',
  header: '',
  enableSorting: false,
  cell: ({ row }) => h(CollectionTableActions, { collection, item: row.original })
}] satisfies TableColumn<TableItem<T>>[]

/**
 * Selectable column.
 */
const prependColumns = computed(() => {
  if (!selectable) return []
  return [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  } satisfies TableColumn<TableItem<T>>]
})

/**
 * Table reference.
 */
const table = useTemplateRef<{ tableApi: Table<T> }>('table')

/**
 * Selected items
 */
const selected = computed((): TableItem<T>[] => {
  return (table.value?.tableApi.getSelectedRowModel().flatRows.map((row: Row<T>) => row.original) ?? []) as TableItem<T>[]
})

/**
 * Selected items IDs
 */
const selectedItemsId = computed(() => toValue(selected)?.map(s => s.id))

/**
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) {
    refreshItems()
    table.value?.tableApi.resetRowSelection()
  }
})

/**
 * Router query state
 */
const { queryWhere, validatedWhere, queryOffset, queryOrderBy } = useQueryRouter(collection, queryRouter)

/**
 * Pagination composable
 */
const { updatePageSize, pagination } = usePagination(collection)

/**
 * Global filter
 */
const globalFilter = ref('')

/**
 * Persisted column visibility
 */
const columnVisibility = useLocalStorage(`hubify.collection.${collection}.columnVisibility`, {} as Record<string, boolean>)

const offset = computed(() => queryOffset.value ?? pagination.value.pageIndex * pagination.value.pageSize)

const orderBy = computed(() => {
  const sorting = table.value?.tableApi.getState().sorting
  if (!sorting?.length) return queryOrderBy.value
  return sorting.map((sort: ColumnSort) => sort.desc ? `-${sort.id}` : sort.id).join(',')
})

watch(offset, (newOffset) => {
  queryOffset.value = newOffset || undefined
})

/**
 * Fetch items for the collection.
 */
const query = computed<QueryParams<Schema, T>>((): QueryParams<Schema, T> => ({
  where: validatedWhere.value,
  limit: pagination.value.pageSize,
  offset: offset.value,
  orderBy: orderBy.value //  table.value?.tableApi.getState().sorting.map((sort: ColumnSort) => sort.desc ? `-${sort.id}` : sort.id)
}))

const {
  getItems,
  deleteItems
} = useItems(collection, query)

const { items, total_count, refresh: refreshItems, status } = await getItems()

async function handlePageSizeChange(newPageSize: number) {
  updatePageSize(newPageSize)
  table.value?.tableApi.setPageSize(newPageSize)
}
</script>

<template>
  <UDashboardPanel id="collection-table">
    <template #header>
      <CollectionTableHeader
        v-model:query-where="queryWhere"
        v-model:global-filter="globalFilter"
        :collection
        :selected
        :table="table?.tableApi"
        :disable-delete-button="!selectedItemsId.length"
        @delete-items="deleteItems(selectedItemsId)"
        @update:page-size="(size: number) => handlePageSizeChange(size)"
      />
    </template>

    <template #body>
      <UTable
        ref="table"
        v-model:pagination="pagination"
        v-model:global-filter="globalFilter"
        v-model:column-visibility="columnVisibility"
        :columns="[...prependColumns, ...collectionColumns, ...actionColumns]"
        :data="items"
        sticky
        :loading="status === 'pending'"
      />
    </template>

    <template
      #footer
    >
      <slot name="footer" />
      <CollectionTableFooter
        :collection="collection"
        :total-count="total_count ?? 0"
      />
    </template>
  </UDashboardPanel>
</template>
