<script setup lang="ts" generic="T extends TableNames">
import CreatePage from './../[collection]/create.vue'

/**
 * Form state for the permissions being created.
 */
const permission = shallowRef<TableFormState<'hubify_permissions'>>()
</script>

<template>
  <div class="p-8 flex flex-col gap-12">
    <CreatePage
      v-model="permission"
      collection="hubify_permissions"
    />

    <PermissionsTester :permissions="[permission]" />
  </div>
</template>
