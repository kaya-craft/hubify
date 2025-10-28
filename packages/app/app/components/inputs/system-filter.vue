<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
interface Props {
  collection: T
  column: C
  state: Record<string, unknown>
  collectionKey: string
}

const { state, collectionKey } = defineProps<Props>()

const value = defineModel<string>()

defineFieldDataTypes('json', 'text', 'jsonb')
defineOptions({ inheritAttrs: false })

/**
 * Use collections composable
 */
const { getCollectionNameByPk } = useCollections()

/**
 * Computed property to parse and stringify JSON value
 */
const jsonValue = computed({
  get: () => {
    try {
      return JSON.parse(toValue(value) || '{}')
    }
    catch {
      return null
    }
  },
  set: (newValue) => {
    value.value = JSON.stringify(newValue, null, 2)
  }
})
</script>

<template>
  <CollectionFilterContent
    v-model="jsonValue"
    :collection="getCollectionNameByPk(state[collectionKey])"
  />
</template>
