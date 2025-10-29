<script setup lang="ts" generic="T extends TableNames">
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
 * List of relations for the current collection.
 */
const { relations } = useTable(collection)

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
 * Handle form success event.
 */
async function onSuccess(_event: TableFormSubmitEvent<T>, stay: boolean) {
  if (!stay && backRoute) {
    await navigateTo(backRoute)
  }
}
</script>

<template>
  <CollectionForm
    v-if="item"
    class="p-8"
    :collection
    :initial-state="item"
    @success="onSuccess"
  />
</template>
