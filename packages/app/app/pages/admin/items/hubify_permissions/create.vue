<script setup lang="ts" generic="T extends TableNames">
import CreatePage from './../[collection]/create.vue'

const formState = ref<TableFormState<'hubify_permissions'>>()
</script>

<template>
  <CreatePage
    v-model="formState"
    collection="hubify_permissions"
  />

  <PermissionsTester :permissions="[formState]" />
</template>
