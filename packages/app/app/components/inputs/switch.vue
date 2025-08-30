<script setup lang="ts">
import type { SwitchProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ SwitchProps {}

const value = defineModel<boolean>()

defineFieldDataTypes('boolean')

defineProps<Props>()
</script>

<template>
  <USwitch
    v-model="value"
  />
</template>
