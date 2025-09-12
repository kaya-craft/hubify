<script setup lang="ts" generic="T extends TableNames, R extends TableRelationNames<T>">
type RelatedTable = TableRelation<T, R>['table']

type Props = {
  collection: T
  relation: R
  displayColumn?: TableColumnNames<RelatedTable>
  value?: TablePrimaryKeyValue<RelatedTable>
}

defineFieldDataTypes('one-to-many')

const { collection, value, relation, displayColumn: _displayColumn } = defineProps<Props>()

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
const { data: label } = useFetch(`/api/items/${toValue(name)}/${value}`, {
  query: {
    columns: toValue(displayColumns)
  },
  transform: (item: TableItem<T>) => getDisplay(toValue(name), item) ?? String(item[toValue(fallbackColumn)])
})
</script>

<template>
  <p>{{ label }}</p>
</template>
