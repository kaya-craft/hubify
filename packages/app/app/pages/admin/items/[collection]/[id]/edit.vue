<script setup lang="ts" generic="T extends TableNames">
definePageMeta({
  validate: to => isString(to.params.id) || isNumber(to.params.id),
  props: to => to.params
})

interface Props {
  collection: T
  id: TablePrimaryKeyValue<T>
}

const { id, collection } = defineProps<Props>()

/**
 * Fetch the item to edit.
 */
const { data: item } = await useFetch(`/api/items/${collection}/${id}`)

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
    :collection
    :initial-state="item"
    @success="onSuccess"
  />
</template>
