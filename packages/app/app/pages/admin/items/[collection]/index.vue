<script setup lang="ts" generic="T extends TableNames">
interface Props {
  collection: T
}

const { collection } = defineProps<Props>()
</script>

<template>
  <CollectionTable
    :collection
    :selectable="true"
  />
  <NuxtPage :collection />
</template>
