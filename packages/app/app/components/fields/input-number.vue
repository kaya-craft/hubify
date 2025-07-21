<script setup lang="ts">
export type Props = {
  cool?: number
}

defineExpose({
  dataTypes: ['int4'] as const
})

defineProps<Props>()
</script>

<template>
  <div>input number</div>
</template>
