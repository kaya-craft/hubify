<script setup lang="ts" generic="T extends TableNames, I extends PrimaryKeyValue<typeof schema, T>">
import type { PrimaryKeyValue } from '@hubify/restql'
import type schema from '#hubify/schema'

interface Props {
  table: T
  id: I
}

const { table, id } = defineProps<Props>()

const loading = ref(false)

const { add } = useToast()

const localePath = useLocalePath()

const { callHook } = useNuxtApp()

const backRoute = localePath({
  name: 'admin-items-collection',
  params: { collection: table }
})

async function close() {
  await navigateTo(backRoute)
}

async function deleteItem() {
  try {
    loading.value = true

    await $fetch(`/api/items/${table}/${id}` as '/api/items/:collection/:id', {
      method: 'delete'
    })

    add({
      title: 'Item deleted',
      color: 'success',
      description: 'The item has been successfully deleted.'
    })

    await callHook('collection:updated', table)

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
