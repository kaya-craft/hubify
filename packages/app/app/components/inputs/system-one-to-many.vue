<script setup lang="ts" generic="T extends TableNames, R extends TableRelationNames<T>">
type RelatedTable = TableRelation<T, R>['table']

type Props = {
  collection: T
  relation: R
  displayColumn?: TableColumnNames<RelatedTable>
}

defineFieldDataTypes('one-to-many')

const value = defineModel<TablePrimaryKeyValue<RelatedTable>>()

const { collection, relation, displayColumn: _displayColumn } = defineProps<Props>()

/**
 * Use table composable
 */
const { getRelation } = useTable(collection)

/**
 * Get related table info
 */
const { primaryKey, name } = useTable(getRelation(relation).table)

/**
 * Use collections composable
 */
const { extractDisplayColumns, getDisplay } = useCollections()

/**
 * Fallback display column
 */
const fallbackColumn = computed(() => {
  return _displayColumn || toValue(primaryKey)
})

/**
 * Columns to fetch for display
 */
const displayColumns = computed(() => {
  return extractDisplayColumns(toValue(name)) ?? [toValue(fallbackColumn)]
})

/**
 * Fetch related items
 */
const { data: items } = useFetch(`/api/items/${toValue(name)}`, {
  query: {
    columns: [toValue(primaryKey), ...toValue(displayColumns)]
  },
  transform: (items: TableItem<TableNames>[]) => items.map(item => ({
    label: getDisplay(toValue(name), item) ?? String(item[toValue(fallbackColumn) as keyof typeof item]),
    value: item[toValue(primaryKey) as keyof typeof item]
  }))
})
</script>

<template>
  <USelect
    v-model="value"
    :items
  />
</template>
