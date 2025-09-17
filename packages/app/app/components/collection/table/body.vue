<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions, UButton, UCheckbox } from '#components'
import type { QueryParams } from '@hubify/restql'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import type { Table } from '@tanstack/vue-table'

type Props = {
  collection: T
  queryRouter?: QueryParams<Schema, T>
  selectable?: boolean
  items: TableItem<T>[]
}

const { selectable, collection, queryRouter } = defineProps<Props>()

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
 * Refresh the collection when the collection is updated.
 */
// onHubifyHook('items', ({ collection: name }) => {
//   if (name === collection) {
//     refreshItems()
//     table.value?.tableApi.resetRowSelection()
//   }
// })

/**
 * Router query state
 */
const { validatedWhere, queryOffset, queryOrderBy } = useQueryRouter(collection, queryRouter)

/**
 * Pagination composable
 */
const { pagination, updatePageSize } = usePagination(collection)

const pageSizes: DropdownMenuItem[] = [{
  label: '10 items',
  value: 10
}, {
  label: '20 items',
  value: 20
}, {
  label: '50 items',
  value: 50
}, {
  label: '100 items',
  value: 100
}].map(item => ({
  ...item,
  onSelect: () => updatePageSize(item.value as number)
}))

/**
 * Column visibility
 */
const columnVisibility = useLocalStorage(`hubify.collection.${collection}.columnVisibility`, {} as Record<string, boolean>)

/**
 * Delete modal state
 */
const deleteModalOpen = ref(false)

function deleteItems() {
  emits('delete-items')
  deleteModalOpen.value = false
}

// const orderBy = computed(() => {
//   const sorting = table.value?.tableApi.getState().sorting
//   if (!sorting?.length) return queryOrderBy.value
//   return sorting.map((sort: ColumnSort) => sort.desc ? `-${sort.id}` : sort.id).join(',')
// })

/**
 * Update table state based on pagination state
 */
watch(pagination, (newValue, oldValue) => {
  if (newValue === oldValue) return
  table.value?.tableApi.setPageSize(newValue.pageSize)
}, { deep: true })
</script>

<template>
  <div>
    <div>
      <div class="grid grid-flow-col gap-4 justify-end bg-slate-950 py-2 px-4">
        <!-- Page size -->
        <div data-testid="table-page-size">
          <UDropdownMenu
            :items="pageSizes"
          >
            <UButton
              color="neutral"
              variant="outline"
              :label="`${pagination.pageSize} items`"
            />
          </UDropdownMenu>
        </div>

        <!-- Column visibility -->
        <div data-testid="column-visibility">
          <UDropdownMenu
            :items="tableColumnsItems"
            :content="{ align: 'end' }"
          >
            <UButton
              label="Columns"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
            />
          </UDropdownMenu>
        </div>
      </div>
    </div>
    <UTable
      ref="table"
      v-model:pagination="pagination"
      v-model:column-visibility="columnVisibility"
      :columns="[...prependColumns, ...collectionColumns, ...actionColumns]"
      :data="items"
      sticky
    />
  </div>
</template>
