<script setup lang="ts" generic="T extends TableNames">
import type { TableNames } from '@hubify/api/types/schema'
import type { ConditionTreeAsArray } from './index.vue'

type Props = {
  collection: T
}

const clause = defineModel<ConditionTreeAsArray<T> & { type: '$and' | '$or' }>({
  required: true
})

const { collection } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * List of items for the dropdown menu to select between AND and OR
 */
const items = computed(() => [
  { label: t('app.admin.filters.and'), value: '$and' },
  { label: t('app.admin.filters.or'), value: '$or' }
])
</script>

<template>
  <div
    class="flex gap-2 items-center p-1.5 bg-gray-100 border-b border-gray-400 dark:bg-gray-800 dark:border-gray-700"
  >
    <UIcon
      name="mdi:drag"
      data-handle="true"
      class="cursor-move size-6"
      data-testid="drag-handle"
    />

    <USelect
      v-model="clause.type"
      size="xs"
      variant="subtle"
      :items="items"
    />

    <div class="flex-1" />

    <slot />
  </div>

  <CollectionFilterClauses
    v-model="clause.children"
    :collection
    class="p-2"
  />
</template>
