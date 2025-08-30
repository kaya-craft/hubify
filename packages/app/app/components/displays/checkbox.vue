<script lang="ts" setup>
interface Props {
  value: boolean | number
}

/**
 * Checkbox
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('boolean')
</script>

<template>
  <UCheckbox
    :default-value="Boolean(value)"
    :disabled="true"
  />
</template>
