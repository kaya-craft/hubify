<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<string>()

defineExpose({
  dataTypes: ['text', 'varchar'] as const
})

defineProps<Props>()
</script>

<template>
  <UInput v-model="value" />
</template>
