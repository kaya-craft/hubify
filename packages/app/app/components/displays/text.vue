<script lang="ts" setup>
interface Props {
  value?: string | number
}

/**
 * Checkbox
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('text', 'varchar', 'integer', 'float', 'double', 'decimal', 'bigInteger')
</script>

<template>
  <p>{{ value }}</p>
</template>
