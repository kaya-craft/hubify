<script setup lang="ts" generic="T extends TableNames">
interface Props {
  collection: T
  id?: TablePrimaryKey<T>
}

definePageMeta({
  props: to => ({
    collection: String(to.params.collection) as T,
    id: to.params.id?.toString()
  })
})

const { collection, id } = defineProps<Props>()
</script>

<template>
  <NuxtPage
    :id
    :collection
  />
</template>
