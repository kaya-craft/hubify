<script setup lang="ts">
export type Props = {
  salut?: string
}

defineExpose({
  dataTypes: ['text'] as const
})

defineProps<Props>()
</script>

<template>
  <div>input text</div>
</template>
