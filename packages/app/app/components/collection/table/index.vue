<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions, UCheckbox, UTable } from '#components'
import type { TableColumn } from '@nuxt/ui'

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

/**
 * Fetch data for the collection.
 */
const { data, status, refresh } = await useFetch<TableItem<T>[]>(`/api/items/${collection}` as `/api/items/:collection`, {
  query: { where: validatedWhere }
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
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-4">
        <slot
          name="prepend-header"
          :selected
        />

        <h2 class="text-lg font-semibold">
          {{ collection }}
        </h2>

        <div class="flex-1" />

        <slot
          name="append-header"
          :selected
        />

        <CollectionFilter
          v-model="queryWhere"
          :collection
        />
      </div>
    </template>

    <UTable
      ref="table"
      :columns="[...prependColumns, ...collectionColumns, ...actionColumns]"
      :data
      sticky
      :loading="status === 'pending'"
    />

    <template #footer>
      <slot
        name="footer"
        :selected
      />
    </template>
  </UCard>
</template>
