<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTreeAsArray } from './index.vue'

type Props = {
  collection: T
}

const children = defineModel<ConditionTreeAsArray[]>('children', {
  required: true
})

const type = defineModel<'$and' | '$or'>('type', {
  required: true
})

const emit = defineEmits<{
  'update:model-value': [ConditionTreeAsArray[]]
}>()

const { collection } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * List of items for the dropdown menu to select between AND and OR
 */
const items = computed(() => {
  return [
    { label: t('app.admin.filters.and'), value: '$and' },
    { label: t('app.admin.filters.or'), value: '$or' }
  ]
})
</script>

<template>
  <div class="flex flex-col gap-2 p-2 bg-gray-100 rounded w-full">
    <div
      class="flex gap-2 items-center"
    >
      <div class="flex gap-2 items-center flex-1">
        <UIcon name="mdi:drag" />

        <USelect
          v-model="type"
          size="xs"
          variant="subtle"
          :items="items"
        />
      </div>

      <slot />
    </div>

    <CollectionFilterClauses
      v-model="children"
      :collection
      class="pl-3"
    />
  </div>
</template>
