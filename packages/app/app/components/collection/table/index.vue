<script setup lang="ts" generic="T extends TableNames">
import type { QueryParams } from '@hubify/restql'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'

const { selectable, collection, baseQueryRouter } = defineProps<{
  collection: T
  baseQueryRouter?: QueryParams<Schema, T>
  selectable?: boolean
}>()

/**
 * Router query state
 */
const { query, queryOrderBy } = useQueryRouter(collection, baseQueryRouter)

/**
 * Pagination
 */
const { pagination } = usePagination(collection)

/**
 * Column visibility
 */
const columnVisibility = useLocalStorage(`hubify.collection.${collection}.columnVisibility`, {} as Record<string, boolean>)

/**
 * Collection definition.
 */
const { displayedColumns, getDisplayComponent, getColumnLabel } = useTable(collection)

/**
 * Table reference.
 */
const table = useTemplateRef<{ tableApi: Table<T> }>('table')

/**
 * List of collection columns.
 */
const collectionColumns = computed(() => {
  return toValue(displayedColumns).map(name => ({
    id: name,
    accessorKey: name,
    header: ({ column }) => {
      const isSorted = column.getIsSorted()
      return h(resolveComponent('UButton'), {
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
  cell: ({ row }) => h(resolveComponent('CollectionTableActions'), { collection, item: row.original })
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
      h(resolveComponent('UCheckbox'), {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(resolveComponent('UCheckbox'), {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  } satisfies TableColumn<TableItem<T>>]
})

/**
 * Fetch items
 */
const { refresh, data } = useItems(collection, query)

/**
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) {
    refresh()
    table.value?.tableApi.resetRowSelection()
  }
})
</script>

<template>
  <div
    data-testid="collection-table"
    class="flex min-h-[calc(100vh_-_var(--ui-header-height))] flex-col overflow-hidden"
  >
    <CollectionTableHeader
      :collection
      :table="table?.tableApi"
      :base-query-router
      :total-count="data?.total_count"
    />

    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:column-visibility="columnVisibility"
      class="flex-1 overflow-y-auto"
      :columns="[...prependColumns, ...collectionColumns, ...actionColumns]"
      :data="data?.items"
      sticky
    />

    <div class="sticky bottom-0 bg-(--ui-bg) shrink-0">
      <CollectionTableFooter
        :collection="collection"
        :total-count="data?.total_count || 0"
      />
    </div>
  </div>
</template>
