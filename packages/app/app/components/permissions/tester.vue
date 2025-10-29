<script setup lang="ts">
import { UFieldGroup } from '#components'

export type Props = {
  permissions: TableFormState<'hubify_permissions'>[]
}

const { permissions } = defineProps<Props>()

const state = reactive({
  url: '',
  method: 'GET' as 'GET' | 'POST' | 'PUT' | 'DELETE',
  body: ''
})

const result = ref<string>('')

const { getCollectionNameByPk } = useCollections()

const header = computed(() => {
  return JSON.stringify(permissions.map(permission => ({
    ...permission,
    collection: getCollectionNameByPk(permission.collection)
  })))
})

async function testPermissions() {
  try {
    result.value = await $fetch(state.url, {
      method: state.method,
      headers: {
        'X-Hubify-Permissions': toValue(header)
      },
      body: state.body ? JSON.parse(state.body) : undefined
    })
  }
  catch (error) {
    result.value = `Error: ${(error as Error).message}`
  }
}
</script>

<template>
  <UFieldGroup>
    <UInput v-model="state.url" />
    <USelect
      v-model="state.method"
      :items="['GET', 'POST', 'PUT', 'DELETE']"
    />
    <UButton @click="testPermissions">
      Test Permissions
    </UButton>
  </UFieldGroup>

  <textarea
    v-model="state.body"
    rows="5"
    class="w-full mt-4 p-2 border rounded"
    placeholder="Request Body (for POST/PUT)"
  />

  <pre>{{ result }}</pre>
</template>
