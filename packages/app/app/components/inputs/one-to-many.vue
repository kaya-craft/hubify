<script setup lang="ts" generic="T extends TableNames, R extends TableRelationNames<T>">
type RelatedTable = TableRelation<T, R>['table']

type Props = {
  collection: T
  relation: R
  displayColumn?: TableColumnNames<RelatedTable>
}

const value = defineModel<TablePrimaryKeyValue<RelatedTable>>()

const { collection, relation, displayColumn: _displayColumn } = defineProps<Props>()

const { getRelation } = useTable(collection)

const { primaryKey, name } = useTable(getRelation(relation).table)

const displayColumn = computed(() => {
  return (_displayColumn || toValue(primaryKey))
})

const { data: items } = useFetch(`/api/items/${toValue(name)}`, {
  query: {
    columns: [toValue(primaryKey), toValue(displayColumn)]
  },
  transform: (items: TableItem<T>[]) => items.map(item => ({
    label: String(item[toValue(displayColumn)]),
    value: item[toValue(primaryKey)]
  }))
})
</script>

<template>
  <USelect
    v-model="value"
    :items
  />
</template>
