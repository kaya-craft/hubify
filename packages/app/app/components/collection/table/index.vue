<script setup lang="ts" generic="T extends TableNames">
import type { TableColumn } from '@nuxt/ui'
import { CollectionTableActions } from '#components'
import type { QueryParams } from '@hubify/restql'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

/**
 * Collection definition.
 */
const { columns } = useTable(collection)

/**
 * Filter query model.
 */
const filter = useRouteQuery<string, QueryParams<Schema, T>['where']>('filter', undefined, {
  transform: {
    get: value => value ? JSON.parse(value) : undefined,
    set: value => JSON.stringify(value)
  }
})

/**
 * Fetch data for the collection.
 */
const { data, status, refresh } = await useFetch(`/api/items/${collection}` as `/api/items/:collection`, {
  query: { where: filter }
})

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
onHubifyHook('items', ({ collection: name }) => {
  if (name === collection) refresh()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-end gap-4">
      <CollectionFilter
        v-model="filter"
        :collection
      />
    </div>

    <UTable
      :columns="[...collectionColumns, ...actionColumns]"
      :data
      sticky
      :loading="status === 'pending'"
    />
  </div>
</template>
