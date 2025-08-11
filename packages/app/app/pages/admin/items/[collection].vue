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

useSeoMeta({
  title: () => collection,
  description: () => ''
})
</script>

<template>
  <NuxtPage :collection />
</template>
