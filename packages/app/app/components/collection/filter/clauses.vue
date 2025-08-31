<script setup lang="ts" generic="T extends TableNames">
import { CollectionFilterAndOrClause, CollectionFilterClause } from '#components'
import type { ConditionTreeAsArray } from './index.vue'

type Props = {
  collection: T
}

const clauses = defineModel<ConditionTreeAsArray<T>[]>()

const emit = defineEmits<{
  'update:model-value': [ConditionTreeAsArray<T>[] | undefined]
}>()

defineProps<Props>()

/**
 * Remove a clause at the given index.
 */
function remove(index: number) {
  clauses.value?.splice(index, 1)
}

/**
 * Copy a clause at the given index.
 */
function copy(item: ConditionTreeAsArray<T>, index: number) {
  clauses.value?.splice(index + 1, 0, JSON.parse(JSON.stringify(item)))
}

/**
 * Translation.
 */
const { t } = useI18n()

watch(clauses, (newValue) => {
  emit('update:model-value', newValue)
}, { deep: true })
</script>

<template>
  <DragAndDrop
    v-model="clauses"
    class="flex gap-2 flex-col"
    data-testid="filter-clauses"
  >
    <template #default="propsData">
      <div
        class="border border-gray-400 rounded overflow-hidden select-none"
        :data-testid="`filter-clause-${propsData.index}`"
      >
        <CollectionFilterClause
          v-if="propsData.item.type === 'clause'"
          v-model="propsData.item"
          :collection
        >
          <UButton
            icon="heroicons:x-mark"
            size="xs"
            color="error"
            :ui="{ base: 'rounded-full' }"
            square
            variant="ghost"
            data-testid="remove-clause"
            @click="remove(propsData.index)"
          />
        </CollectionFilterClause>

        <CollectionFilterAndOrClause
          v-else
          v-model="propsData.item"
          :collection
        >
          <UButton
            icon="heroicons:document-duplicate"
            size="xs"
            color="info"
            :ui="{ base: 'rounded-full' }"
            square
            variant="ghost"
            data-testid="copy-group"
            @click="copy(propsData.item, propsData.index)"
          />

          <UButton
            icon="heroicons:x-mark"
            size="xs"
            color="error"
            :ui="{ base: 'rounded-full' }"
            square
            variant="ghost"
            data-testid="remove-group"
            @click="remove(propsData.index)"
          />
        </CollectionFilterAndOrClause>
      </div>
    </template>

    <template #empty="{ active }">
      <div
        class="p-4 border-gray-300 border-2 text-sm text-center border-dashed rounded transition-colors"
        :class="[active ? 'bg-gray-100 text-gray-500' : 'text-gray-400']"
        data-testid="filter-drop-here"
      >
        {{ t('app.admin.filters.drop-inside-group') }}
      </div>
    </template>
  </DragAndDrop>
</template>
