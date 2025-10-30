<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
const { collection, column } = defineProps<{
  collection: T
  column: C
  value: unknown
}>()

const { getDisplayComponent, getColumnLabel } = useTable(collection)
</script>

<template>
  <div
    v-if="getDisplayComponent(column)"
    class="flex gap-4 mb-4 items-center"
  >
    <p class="font-bold">
      {{ getColumnLabel(column) }}
    </p>

    <component
      :is="getDisplayComponent(column)"
      :key="column"
      :value
    />
  </div>
</template>
