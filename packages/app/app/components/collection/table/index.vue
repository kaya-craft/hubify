<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions, UCheckbox, UTable } from '#components'
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
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
 * Get current collection from hubify_collections
 */
const { currentCollection } = useCollections()

/**
 * Display Icon component from hubify_collections icon field
 */
const { getDisplayComponent: getHubifyDisplayComponent } = useTable('hubify_collections')
const collectionIconComponent = h(getHubifyDisplayComponent('icon'), { value: currentCollection?.value?.icon })

/**
 * Where query.
 */
const { queryWhere, validatedWhere } = useQueryWhere(collection, where)

/**
 * Persisted limit for the collection.
 */
const limit = useLocalStorage(`hubify.collection.${collection}.limit`, 10)

/**
 * Fetch data for the collection.
 */
const { data, status, refresh } = await useFetch<TableItem<T>[]>(`/api/items/${collection}` as `/api/items/:collection`, {
  query: { where: validatedWhere, limit: limit.value }
})

/**
 * List of collection columns.
 */
const collectionColumns = computed(() => {
  return toValue(displayedColumns).map(name => ({
    id: name,
    accessorKey: name,
    header: getColumnLabel(name),
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
  return (table.value?.tableApi.getSelectedRowModel().flatRows.map(row => row.original) ?? []) as TableItem<T>[]
})

/**
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) {
    refresh()
    table.value?.tableApi.resetRowSelection()
  }
})

/**
 * Pagination
 */
const availablePageSizes: DropdownMenuItem[] = [{
  label: '10',
  value: 10
}, {
  label: '20',
  value: 20
}, {
  label: '50',
  value: 50
}, {
  label: '100',
  value: 100
}].map(item => ({
  ...item,
  onSelect: () => updatePagination(item.value as number)
}))

const pagination = ref({
  pageIndex: 0,
  pageSize: limit.value
})

function updatePagination(newPageSize: number) {
  table.value?.tableApi.setPagination({
    pageIndex: 0,
    pageSize: newPageSize
  })
  limit.value = newPageSize
}
</script>

<template>
  <UDashboardPanel id="collection-table">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <slot name="prepend-header" />
          <component
            :is="collectionIconComponent"
            v-if="collectionIconComponent"
            :style="`color: ${currentCollection?.color}`"
          />
        </template>

        <template #title>
          <h2
            :style="`color: ${currentCollection?.color}`"
            class="text-lg font-semibold capitalize"
          >
            {{ collection }}
          </h2>
        </template>

        <template #right>
          <slot name="append-header" />
          <UDropdownMenu
            :items="availablePageSizes"
            @update:model-value="updatePagination"
          >
            <UButton
              icon="i-lucide-menu"
              color="neutral"
              variant="outline"
            />
          </UDropdownMenu>

          <CollectionFilter
            v-model="queryWhere"
            :collection
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        ref="table"
        v-model:pagination="pagination"
        :columns="[...prependColumns, ...collectionColumns, ...actionColumns]"
        :data
        sticky
        :loading="status === 'pending'"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
          rowCount: data?.length,
          manualPagination: true
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
        :items-per-page="table?.tableApi?.getState().pagination.pageSize"
        :total="table?.tableApi?.getFilteredRowModel().rows.length"
        @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
      />
    </template>
  </UDashboardPanel>
</template>
