<script setup lang="ts" generic="T extends TableNames">
import { CollectionTableActions } from '#components'
import type { TableColumn } from '@nuxt/ui'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

/**
 * Collection definition.
 */
const { columns, getDisplayComponent, getDisplay } = useTable(collection)

/**
 * Fetch data for the collection.
 */
const { data, status, refresh } = await useFetch(`/api/items/${collection}` as `/api/items/:collection`)

/**
 * List of collection columns.
 */
const collectionColumns = computed(() => {
  return Object.entries(toValue(columns))
    .map(([name, column]) => {
      const display = getDisplay(name as TableColumnNames<T>)
      if (!display) return
      return {
        id: name,
        accessorKey: name,
        header: column.label ?? name,
        cell: ({ row }) => {
          const value = row.original[name as keyof typeof row.original]
          const component = getDisplayComponent(name as TableColumnNames<T>, value as string)
          return h(component, {
            value
          })
        }

      } satisfies TableColumn<TableItem<T>>
    }).filter(Boolean)
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
 * Refresh the collection when the collection is updated.
 */
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) {
    refresh()
  }
})
</script>

<template>
  <UTable
    :columns="[...collectionColumns, ...actionColumns]"
    :data
    sticky
    :loading="status === 'pending'"
  />
</template>
