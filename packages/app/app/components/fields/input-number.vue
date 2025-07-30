<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<number>()

defineFieldDataTypes('boolean')

defineProps<Props>()
</script>

<template>
  <UInput
    v-model="value"
    type="number"
  />
</template>
