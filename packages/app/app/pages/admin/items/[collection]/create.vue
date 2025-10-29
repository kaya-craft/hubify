<script setup lang="ts" generic="T extends TableNames">
interface Props {
  collection: T
}

const value = defineModel<TableFormState<T>>()

const { collection } = defineProps<Props>()

const router = useRouter()

/**
 * Handle form success event
 */
function onSuccess(_event: TableFormSubmitEvent<T>, stay: boolean) {
  if (!stay) router.back()
}
</script>

<template>
  <CollectionForm
    v-model="value"
    :collection
    class="p-8"
    @success="onSuccess"
  />
</template>
