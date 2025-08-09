<script setup lang="ts" generic="T extends TableNames, I extends TablePrimaryKey<T>">
interface Props {
  collection: T
  id: I
}

const { id, collection } = defineProps<Props>()

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
</template>
