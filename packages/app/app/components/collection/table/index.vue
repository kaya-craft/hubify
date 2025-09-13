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
  getItems
} = useItems(collection)

/**
 * Fetch items for the collection.
 */
const { data: items, execute: fetchItems, status } = getItems(validatedWhere)
await fetchItems()

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
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) {
    fetchItems()
    table.value?.tableApi.resetRowSelection()
  }
})

/**
 * Persisted limit for the collection.
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
 * Column visibility
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
      />

      <!-- <UDashboardNavbar>
        <template #leading>
          <slot
            name="prepend-header"
            :selected
          />
          <component
            :is="collectionIconComponent"
            v-if="collectionIconComponent"
            :style="`color: ${currentCollection?.color}`"
          />
        </template>

        <template #title>
          <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
            <h2
              :style="`color: ${currentCollection?.color}`"
              class="text-lg font-semibold capitalize"
            >
              {{ collection }}
            </h2>
            <UInput
              v-model="globalFilter"
              placeholder="Search ..."
            />
          </div>
        </template>

        <template #right>
          <div class="flex flex-row gap-6">
            <slot
              name="append-header"
              :selected
            />
            <UDropdownMenu
              :items="pageSizes"
              @update:model-value="updatePagination"
            >
              <UButton
                color="neutral"
                variant="outline"
                :label="`${pageSize} items`"
              />
            </UDropdownMenu>

            <CollectionFilter
              v-model="queryWhere"
              :collection
            />

            <UButton
              :disabled="!itemsToDelete.length"
              color="error"
              variant="outline"
              icon="heroicons:trash"
              :loading="status === 'pending'"
              @click="deleteItems(itemsToDelete)"
            />

            <UDropdownMenu
              :items="
                table?.tableApi
                  ?.getAllColumns()
                  .filter((column: Column<T>) => column.getCanHide())
                  .filter((column: Column<T>) => column.id !== 'select' && column.id !== 'actions')
                  .map((column: Column<T>) => ({
                    label: column.id,
                    type: 'checkbox' as const,
                    checked: column.getIsVisible(),
                    onUpdateChecked(checked: boolean) {
                      table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                    },
                    onSelect(e?: Event) {
                      e?.preventDefault()
                    }
                  }))
              "
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
        </template>
      </UDashboardNavbar> -->
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
