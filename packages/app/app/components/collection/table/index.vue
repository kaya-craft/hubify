<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'

const { selectable, collection, baseQueryRouter } = defineProps<{
  collection: T
  baseQueryRouter?: QueryParams<T>
  selectable?: boolean
}>()

/**
 * Router query state
 */
const { query, orderBy, page, limit } = useQueryRouter(collection, baseQueryRouter)

/**
 * Pagination state
 */
const pagination = reactive({
  page,
  pageSize: limit
})

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
          orderBy.value = (column.getIsSorted() === 'asc' ? `-${name}` : name) as unknown as QueryParams<T>['orderBy']
          return column.toggleSorting(column.getIsSorted() === 'asc')
        }
      })
    },
    cell: ({ row }) => {
      const value = row.original[name as keyof typeof row.original]
      const component = getDisplayComponent(name)
      if (!component) return
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
  // @ts-expect-error - I don't know why this is failing?
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
const { refresh, data } = useItems(collection, { query, paginate: true })

/**
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (String(name) !== String(collection)) return
  refresh()
  table.value?.tableApi.resetRowSelection()
})
</script>

<template>
  <div
    data-testid="collection-table"
    class="flex min-h-[calc(100vh-var(--ui-header-height))] flex-col overflow-hidden divide-y divide-muted"
  >
    <CollectionTableHeader
      :collection
      :table="table?.tableApi"
      :base-query-router
      :total-count="data?.total"
      size="sm"
      variant="soft"
      color="neutral"
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

    <CollectionTableFooter
      :collection="collection"
      :total-items="data?.total || 0"
      :displayed-items="table?.tableApi.getRowCount()"
      size="sm"
      variant="soft"
      color="neutral"
      class="sticky bottom-0 shrink-0"
    />
  </div>
</template>
