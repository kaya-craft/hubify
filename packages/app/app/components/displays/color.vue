<script lang="ts" setup>
interface Props {
  value?: string
}

/**
 * Color props
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('text', 'varchar')
</script>

<template>
  <UBadge
    variant="soft"
    class="size-6 rounded-full"
    :style="{ backgroundColor: value || '#fff' }"
  />
</template>
