<script setup lang="ts">
import tables from '#hubify/schema'

interface Props {
  collection: TableNames
}

definePageMeta({
  validate: (to) => {
    return String(to.params.collection) in tables
  },
  props: to => ({
    collection: String(to.params.collection) as TableNames
  })
})

const { collection } = defineProps<Props>()

const { getCollectionMeta } = useCollections()

usePageTitle({
  title: getCollectionMeta(collection)?.name || 'Hubify collections',
  icon: getCollectionMeta(collection)?.icon
})
</script>

<template>
  <NuxtPage :collection />
</template>
