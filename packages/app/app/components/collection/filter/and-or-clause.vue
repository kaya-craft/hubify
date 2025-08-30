<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTreeAsArray } from './index.vue'

type Props = {
  collection: T
  level?: number
}

const clause = defineModel<ConditionTreeAsArray<T> & { type: '$and' | '$or' }>({
  required: true
})

const emit = defineEmits<{
  'update:modelValue': [value: ConditionTreeAsArray<T> & { type: '$and' | '$or' }]
}>()

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

/**
 * Update the model value when the clause changes.
 */
function updateModelValue() {
  emit('update:modelValue', { ...toValue(clause) })
}
</script>

<template>
  <div class="flex flex-col gap-2 p-2 bg-gray-100 rounded w-full">
    <div
      class="flex gap-2 items-center"
    >
      <div class="flex gap-2 items-center flex-1">
        <UIcon
          name="mdi:drag"
          class="drag-handle cursor-move"
          data-testid="drag-handle"
        />

        <USelect
          v-model="clause.type"
          size="xs"
          variant="subtle"
          :items="items"
          @update:model-value="updateModelValue"
        />
      </div>

      <slot />
    </div>

    <CollectionFilterClauses
      v-model="clause.children"
      :collection
      class="pl-3"
      :level
      @update:model-value="updateModelValue"
    />
  </div>
</template>
