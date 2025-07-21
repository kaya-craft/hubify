<script setup lang="ts">
export type Props = {
  cool: number
}

defineExpose({
  dataTypes: [] as const
})

defineProps<Props>()
</script>

<template>
  <div>input number</div>
</template>
