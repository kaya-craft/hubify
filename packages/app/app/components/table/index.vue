<script setup lang="ts" generic="T extends TableNames">
import type { TableColumn } from '@nuxt/ui'

type Props = {
  table: T
}

const { table } = defineProps<Props>()

/**
 * Table definition.
 */
const { columns } = useTable(table)

/**
 * Nuxt app.
 */
const { hook } = useNuxtApp()

/**
 * Fetch data for the table.
 */
const { data, status, refresh } = await useFetch(`/api/items/${table}` as `/api/items/:collection`)

/**
 * List of table columns.
 */
const tableColumns = computed(() => {
  return Object.entries(toValue(columns)).map(([name, column]) => ({
    id: name,
    accessorKey: name,
    header: column.label ?? name
  }) satisfies TableColumn<unknown>)
})

/**
 * List of action columns.
 */
const actionColumns = [{
  id: 'actions',
  accessorKey: '',
  header: '',
  enableSorting: false,
  cell: ({ row }) => h(resolveComponent('TableActions'), { table, item: row.original })
}] satisfies TableColumn<unknown>[]

/**
 * Refresh the table when the collection is updated.
 */
hook('collection:updated', (collection) => {
  if (collection === table) refresh()
})
</script>

<template>
  <UTable
    :columns="[...tableColumns, ...actionColumns]"
    :data
    sticky
    :loading="status === 'pending'"
  />
</template>
