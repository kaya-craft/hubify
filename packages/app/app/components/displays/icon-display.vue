<script lang="ts" setup>
interface Props {
  value?: string
}

/**
 * Icon props
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('text', 'varchar')
</script>

<template>
  <UIcon
    v-if="value"
    :name="value"
    size="24"
  />
</template>
