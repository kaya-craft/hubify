<script lang="ts" setup>
interface Props {
  value?: string | number
}

/**
 * Checkbox
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('text', 'varchar')
</script>

<template>
  <p>{{ value }}</p>
</template>
