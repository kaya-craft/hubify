<script setup lang="ts" generic="T extends TableNames, I extends TablePrimaryKeyValue<T>">
interface Props {
  collection: T
  id?: I
}

const { collection } = defineProps<Props>()
</script>

<template>
  <CollectionTable
    :collection
    :selectable="true"
  />
</template>
