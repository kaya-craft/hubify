<script setup lang="ts" generic="T extends TableNames">
import { isManyToOneRelation } from '@hubify/api/column-types'

interface Props {
  collection: T
  id: TablePrimaryKeyValue<T>
}

const { id, collection } = defineProps<Props>()

/**
 * Fetch the item to edit.
 */
const { data: item } = await useFetch('/api/items/' + collection + '/' + id)

/**
 * If the item does not exist, throw a 404 error.
 */
if (!toValue(item)) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Item not found'
  })
}

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * Locale path instance.
 */
const localePath = useLocalePath()

/**
 * Back route to the collection items list.
 */
const backRoute = localePath({
  name: 'admin-items-collection',
  params: { collection: collection }
})

/**
 * Table composable.
 */
const { relations } = useTable(collection)

/**
 * Handle form success event.
 */
async function onSuccess(_event: TableFormSubmitEvent<T>, stay: boolean) {
  if (!stay && backRoute) {
    await navigateTo(backRoute)
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
      @success="onSuccess"
    />
  </UCard>

  <template
    v-for="(relation, relationName) in relations"
    :key="relation.table"
  >
    <CollectionTableRelation
      v-if="isManyToOneRelation(collection, relationName)"
      :id="id"
      :collection="collection"
      :relation="relationName"
    />
  </template>
</template>
