<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions, UButton, UCheckbox } from '#components'
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/vue-table'
import { getPaginationRowModel } from '@tanstack/vue-table'

type Props = {
  collection: T
  where?: Where<T>
  selectable?: boolean
}

const { selectable, collection, where } = defineProps<Props>()

/**
 * Collection definition.
 */
const { displayedColumns, getDisplayComponent, getColumnLabel } = useTable(collection)

/**
 * Where query.
 */
const { queryWhere, validatedWhere } = useQueryWhere(collection, where)

const {
  getItems,
  deleteItems
} = useItems(collection)

/**
 * Fetch items for the collection.
 */
const { data: items, refresh: refreshItems, status } = await getItems(validatedWhere)

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
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
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
const table = useTemplateRef('table')

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
 * Persisted page size
 */
const pageSize = useLocalStorage(`hubify.collection.${collection}.limit`, 10)

const pagination = ref({
  pageIndex: 0,
  pageSize: pageSize.value
})

/**
 * Global filter
 */
const globalFilter = ref('')

/**
 * Persisted column visibility
 */
const columnVisibility = useLocalStorage(`hubify.collection.${collection}.columnVisibility`, {} as Record<string, boolean>)
</script>

<template>
  <UDashboardPanel id="collection-table">
    <template #header>
      <CollectionTableHeader
        v-model:query-where="queryWhere"
        v-model:global-filter="globalFilter"
        v-model:page-size="pageSize"
        :collection
        :selected
        :table="table?.tableApi"
        :disable-delete-button="!selectedItemsId.length"
        @delete-items="deleteItems(selectedItemsId)"
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
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel()
        }"
      />
    </template>

    <template
      #footer
    >
      <slot name="footer" />
      <UPagination
        class="flex justify-center p-4 border-t-1 border-slate-600"
        :default-page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
        :items-per-page="pageSize"
        :total="items?.length"
        @update:page="(p: number) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </template>
  </UDashboardPanel>
</template>
