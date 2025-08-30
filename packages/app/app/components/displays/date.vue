<script lang="ts" setup>
interface Props {
  value?: string | number | Date
}

/**
 * Date props
 */
const { value } = defineProps<Props>()

defineFieldDataTypes('date', 'timestamp', 'timestamptz')
</script>

<template>
  <NuxtTime
    v-if="value"
    :datetime="value"
    year="numeric"
    month="long"
    day="numeric"
    hour="2-digit"
    minute="2-digit"
  />
</template>
