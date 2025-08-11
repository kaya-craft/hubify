<script setup lang="ts">
import type { SwitchProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ SwitchProps {}

const value = defineModel<boolean>()

defineExpose({
  dataTypes: ['boolean'] as const
})

defineProps<Props>()
</script>

<template>
  <USwitch
    v-model="value"
  />
</template>
