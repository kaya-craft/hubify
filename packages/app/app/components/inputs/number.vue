<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<number>()

defineProps<Props>()

defineFieldDataTypes('integer', 'bigInteger', 'float', 'double', 'decimal', 'mediumint')
</script>

<template>
  <UInput
    v-model="value"
    type="number"
  />
</template>
