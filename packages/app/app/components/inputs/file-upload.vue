<script setup lang="ts">
import type { FileUploadProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ FileUploadProps {}

/**
 * File path
 */
const file = defineModel<File>()

/**
 * Expose the data types supported.
 */
defineFieldDataTypes('text')

/**
 * Props for the file upload component.
 */
defineProps<Props>()
</script>

<template>
  <UFileUpload
    v-model="file"
  />
</template>
