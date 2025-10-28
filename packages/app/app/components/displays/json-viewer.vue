<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
interface Props {
  collection: T
  column: C
  value: string
}

defineProps<Props>()

defineFieldDataTypes('json', 'text', 'jsonb')
defineOptions({ inheritAttrs: false })
</script>

<template>
  <pre class="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
    {{ value }}
  </pre>
</template>
