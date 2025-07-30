<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<string>()

defineFieldDataTypes('text', 'varchar', 'uuid')

defineProps<Props>()
</script>

<template>
  <UInput v-model="value" />
</template>
