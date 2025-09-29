<script setup lang="ts" generic="T extends Record<string, unknown>, K extends KeyContainingCollection<T>">
export type KeyContainingCollection<T> = string | {
  [K in keyof T]: T[K] extends TableNames ? K : never
}[keyof T]

type Props = {
  state?: T
  collectionKey: K
  collection?: never
} | {
  state?: never
  collectionKey?: never
  collection: TableNames
}

defineFieldDataTypes('text', 'varchar')

const value = defineModel<string>()

const { collectionKey, state, collection } = defineProps<Props>()

/**
 * Determine the collection name based on props
 */
const collectionName = computed(() => {
  return (collectionKey && state ? state[collectionKey] : collection) as TableNames
})

/**
 * Composable to interact with collections
 */
const { columnNames } = useTable(collectionName)
</script>

<template>
  <InputsTemplateVariable
    v-model="value"
    :variables="columnNames"
  />
</template>
