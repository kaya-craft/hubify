<script setup lang="ts">
import tables from '#hubify/schema'

definePageMeta({
  validate: to => String(to.params.collection) in tables,
  props: to => to.params
})

interface Props {
  collection: TableNames
  id?: TablePrimaryKeyValue<TableNames>
}

const { collection } = defineProps<Props>()

/**
 * Collections composable.
 */
const { getCollectionMeta } = useCollections()

/**
 * Collection meta information.
 */
const meta = computed(() => {
  return getCollectionMeta(collection)
})

usePageTitle({
  title: toValue(meta)?.name,
  icon: toValue(meta)?.icon || ''
})
</script>

<template>
  <NuxtPage :collection />
</template>
