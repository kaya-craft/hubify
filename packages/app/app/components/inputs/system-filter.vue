<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
interface Props {
  collection: T
  column: C
  state: Record<string, unknown>
  collectionKey: string
}

const { state, collectionKey } = defineProps<Props>()

const modelValue = defineModel<string>()

defineFieldDataTypes('json', 'text', 'jsonb')
defineOptions({ inheritAttrs: false })

/**
 * Use collections composable
 */
const { getCollectionNameByPk } = useCollections()

/**
 * Computed property to parse and stringify JSON value
 */
const jsonValue = normalizeJSONValue(modelValue)
</script>

<template>
  <CollectionFilterContent
    v-model="jsonValue"
    :collection="getCollectionNameByPk(state[collectionKey])"
  />
</template>
