<script lang="ts" setup>
interface Props {
  value: string
}

/**
 * Color props
 */
const { value: color } = defineProps<Props>()

defineFieldDataTypes('text', 'varchar')
</script>

<template>
  <UBadge
    variant="subtle"
    size="lg"
    class="size-6 rounded-full"
    :style="{ backgroundColor: color }"
  />
</template>
