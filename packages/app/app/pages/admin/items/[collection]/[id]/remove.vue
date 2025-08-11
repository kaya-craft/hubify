<script setup lang="ts" generic="T extends TableNames, I extends TablePrimaryKey<T>">
interface Props {
  collection: T
  id: I
}

const { collection, id } = defineProps<Props>()

const loading = ref(false)

const { add } = useToast()

const localePath = useLocalePath()

const backRoute = localePath({
  name: 'admin-items-collection',
  params: { collection: collection }
})

async function close() {
  await navigateTo(backRoute)
}

async function deleteItem() {
  try {
    loading.value = true

    await $fetch(`/api/items/${collection}/${id}` as '/api/items/:collection/:id', {
      method: 'delete'
    })

    add({
      title: 'Item deleted',
      color: 'success',
      description: 'The item has been successfully deleted.'
    })

    callHubifyHook('items:deleted', { collection, id })

    close()
  }
  catch (error) {
    add({
      title: 'Error deleting item',
      color: 'error',
      description: 'An error occurred while deleting the item. ' + String(error)
    })
  }
  finally {
    loading.value = false
  }
}

const { t } = useI18n()
</script>

<template>
  <UModal
    :close="{ onClick: close }"
    :title="t('app.form.actions.delete')"
    default-open
    @after:leave="close"
  >
    <template #footer>
      <div class="flex gap-2">
        <UButton
          color="neutral"
          :label="t('app.back')"
          @click="close"
        />
        <UButton
          color="error"
          :label="t('app.form.actions.delete')"
          @click="deleteItem"
        />
      </div>
    </template>
  </UModal>
</template>
