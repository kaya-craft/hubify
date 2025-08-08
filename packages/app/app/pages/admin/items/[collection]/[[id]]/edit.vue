<script setup lang="ts" generic="T extends TableNames, I extends PrimaryKeyValue<typeof schema, T>">
import type { PrimaryKeyValue } from '@hubify/restql'
import type schema from '#hubify/schema'

interface Props {
  table: T
  id: I
}

const { id, table } = defineProps<Props>()

const { data: item } = await useFetch('/api/items/' + table + '/' + id)

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
  params: { collection: table }
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
          {{ table }}
        </h2>
      </div>
    </template>

    <FormTable
      v-if="item"
      :table
      :initial-state="item"
      type="update"
      @success="onSuccess"
    />
  </UCard>
</template>
