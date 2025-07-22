<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<number>()

defineExpose({
  dataTypes: ['int4', 'int8', 'numeric'] as const
})

defineProps<Props>()
</script>

<template>
  <UInput
    v-model="value"
    type="number"
  />
</template>
