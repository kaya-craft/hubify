<script setup lang="ts" generic="T extends TableNames, I extends TablePrimaryKey<T>">
import schema from '#hubify/schema'
import type { TableName, TableRelation } from '@hubify/restql'
import { getPrimaryKey } from '@hubify/restql/utils/helpers'

interface Props {
  collection: T
  id: I
}

const { id, collection } = defineProps<Props>()

const { relations } = useTable(collection)

const { data: item } = await useFetch('/api/items/' + collection + '/' + id)

if (!toValue(item)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Item not found'
  })
}

const { t } = useI18n()

const localePath = useLocalePath()

const backRoute = localePath({
  name: 'admin-items-collection',
  params: { collection: collection }
})

const router = useRouter()

function onSuccess(_event: TableFormSubmitEvent<T>, stay: boolean) {
  if (!stay && backRoute) {
    router.push(backRoute)
  }
}

const attaching = ref(false)
const detaching = ref(false)

/**
 * On select items to attach to the current item.
 */
async function attach(items: TableItem<TableNames>[], relation: TableNames, key: string, close: () => void) {
  const primaryKey = getPrimaryKey(schema, relation)

  if (!primaryKey) {
    throw new Error(`Primary key not found for collection ${relation}`)
  }
  try {
    attaching.value = true
    await $fetch('/api/items/' + relation, {
      method: 'put',
      query: { where: { [primaryKey]: { $in: items.map(item => item[primaryKey]) } } },
      body: { [key]: id }
    })

    close()
  }
  catch (error) {
    console.error('Error attaching items:', error)
  }
  finally {
    attaching.value = false
  }
}

/**
 * Detach selected items from the current item.
 */
async function detatch(items: TableItem<TableNames>[], relation: TableNames, key: string) {
  const primaryKey = getPrimaryKey(schema, relation)

  if (!primaryKey) {
    throw new Error(`Primary key not found for collection ${relation}`)
  }

  try {
    detaching.value = true
    await $fetch('/api/items/' + relation, {
      method: 'put',
      query: { where: { [primaryKey]: { $in: items.map(item => item[primaryKey]) } } },
      body: { [key]: null }
    })
  }
  catch (error) {
    console.error('Error detatching items:', error)
  }
  finally {
    detaching.value = false
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center gap-4">
        <UButton
          :to="backRoute"
          variant="ghost"
          color="secondary"
          icon="heroicons:arrow-left"
          :aria-label="t('app.back')"
        />
        <h2 class="text-lg font-semibold">
          {{ collection }}
        </h2>
      </div>
    </template>

    <CollectionForm
      v-if="item"
      :collection
      :initial-state="item"
      type="update"
      @success="onSuccess"
    />
  </UCard>

  <CollectionTable
    v-for="relation in relations"
    :key="relation.table"
    :collection="(relation.table as TableNames)"
    :where="{ [relation.toKey]: { $eq: id } }"
    class="mt-6"
    selectable
  >
    <template #append-header="{ selected }">
      <UButton
        v-if="selected.length"
        variant="soft"
        color="error"
        leading-icon="heroicons:trash"
        :loading="detaching"
        @click="detatch(selected, relation.table, relation.toKey)"
      >
        {{ t('app.admin.items.detatch-items', { name: relation.table }) }}
      </UButton>

      <UModal :dismissible="false">
        <UButton
          variant="soft"
          color="secondary"
          leading-icon="heroicons:plus"
        >
          {{ t('app.admin.items.attach-items', { name: relation.table }) }}
        </UButton>

        <template #content="{ close }">
          <CollectionTable
            :collection="(relation.table as TableNames)"
            :where="{ $or: [{ [relation.toKey]: { $neq: id } }, { [relation.toKey]: { $null: true } }] }"
            selectable
          >
            <template #footer="{ selected }">
              <div class="flex items-center gap-4 justify-end">
                <UButton
                  variant="soft"
                  color="warning"
                  @click="close"
                >
                  {{ t('app.admin.form.cancel') }}
                </UButton>

                <UButton
                  variant="solid"
                  class="ml-2"
                  :loading="attaching"
                  @click="attach(selected, relation.table, relation.toKey, close)"
                >
                  {{ t('app.admin.form.submit') }}
                </UButton>
              </div>
            </template>
          </CollectionTable>
        </template>
      </UModal>
    </template>
  </CollectionTable>
</template>
