<script setup lang="ts">
import tables from '#hubify/schema'

interface Props {
  table: TableNames
}

definePageMeta({
  validate: (to) => {
    return String(to.params.collection) in tables
  },
  props: to => ({
    table: String(to.params.collection) as TableNames
  })
})

const { table } = defineProps<Props>()

useSeoMeta({
  title: () => table,
  description: () => ''
})
</script>

<template>
  <NuxtPage :table />
</template>
