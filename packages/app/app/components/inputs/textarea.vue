<script setup lang="ts">
import type { InputProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputProps {}

const value = defineModel<string | undefined>()

defineFieldDataTypes('text', 'varchar', 'uuid')

defineProps<Props>()
</script>

<template>
  <UTextarea v-model="value" />
</template>
