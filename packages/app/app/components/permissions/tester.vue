<script setup lang="ts">
import { UFieldGroup } from '#components'
import { TEST_PERMISSIONS_HEADER } from '@hubify/api/server/utils/permissions'
import { joinURL } from 'ufo'

export type Props = {
  permissions: (TableFormState<'hubify_permissions'> | undefined)[]
}

const { permissions } = defineProps<Props>()

/**
 * Get the collection name by primary key.
 */
const { getCollectionNameByPk, collections } = useCollections()

/**
 * Methods
 */
const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const

/**
 * State for the permission tester.
 */
const state = reactive({
  collection: null as string | null,
  primaryKey: null as string | null,
  method: 'GET' as (typeof methods)[number],
  body: null as string | null,
  result: null as unknown | null,
  error: null as string | null
})

/**
 * Result of the permission test.
 */
const headerValue = computed(() => {
  return permissions.filter(isNonNullish).map(permission => ({
    action: permission.action,
    collection: getCollectionNameByPk(permission.collection),
    where: permission.where
  }))
})

/**
 * Full url.
 */
const fullUrl = computed(() => {
  if (!state.collection) return null

  return joinURL('/api/items', state.collection, state.primaryKey ?? '')
})

/**
 * Run the permission test.
 */
async function testPermissions() {
  const url = toValue(fullUrl)

  if (!url) return

  try {
    state.error = null
    state.result = null

    state.result = await $fetch(url, {
      method: state.method,
      headers: { [TEST_PERMISSIONS_HEADER]: JSON.stringify(toValue(headerValue)) },
      body: state.body ? JSON.parse(state.body) : undefined
    })
  }
  catch (error) {
    state.error = error instanceof Error ? error.message : String(error)
  }
}

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="text-2xl font-bold">
      Permissions Tester
    </h2>

    <UFieldGroup class="mx-auto flex items-center">
      <UInput
        disabled
        readonly
        value="/api/items/"
        class="min-w-0 flex-none"
      />

      <USelect
        v-model="state.collection"
        :items="collections"
        label-key="name"
        class="flex-1"
        :placeholder="t('app.admin.test-permissions.select-collection')"
        value-key="name"
      />

      <UInput
        v-model="state.primaryKey"
        :placeholder="t('app.admin.test-permissions.primary-key-placeholder')"
        class="min-w-0 flex-none"
      />

      <USelect
        v-model="state.method"
        :items="[...methods]"
      />
      <UButton
        :disabled="!fullUrl"
        @click="testPermissions"
      >
        Test Permissions
      </UButton>
    </UFieldGroup>

    <textarea
      v-if="['POST', 'PUT'].includes(state.method)"
      v-model="state.body"
      rows="5"
      class="w-full mt-4 p-2 border rounded"
      placeholder="Request Body (for POST/PUT)"
    />

    <div
      v-if="state.result"
      class="mt-4 p-4 border rounded "
    >
      <h3 class="font-bold mb-2">
        Result:
      </h3>
      <pre>{{ JSON.stringify(state.result, null, 2) }}</pre>
    </div>

    <div
      v-else-if="state.error"
      class="mt-4 p-4 border rounded bg-red-400 text-white"
    >
      <h3 class="font-bold mb-2">
        Error:
      </h3>
      <pre>{{ state.error }}</pre>
    </div>
  </div>
</template>
