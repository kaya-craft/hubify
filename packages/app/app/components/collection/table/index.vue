<script setup lang="ts" generic="T extends TableNames">
import type { TableColumn } from '@nuxt/ui'
import { CollectionTableActions } from '#components'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

/**
 * Collection definition.
 */
const { columns } = useTable(collection)

/**
 * Nuxt app.
 */
const { hook } = useNuxtApp()

/**
 * Fetch data for the collection.
 */
const { data, status, refresh } = await useFetch(`/api/items/${collection}` as `/api/items/:collection`)

/**
 * List of collection columns.
 */
const collectionColumns = computed(() => {
  return Object.entries(toValue(columns)).map(([name, column]) => ({
    id: name,
    accessorKey: name,
    header: column.label ?? name
  }) satisfies TableColumn<TableItem<T>>)
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
hook('collection:updated', (collection) => {
  if (collection === collection) refresh()
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
