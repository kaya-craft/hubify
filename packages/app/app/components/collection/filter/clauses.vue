<script setup lang="ts" generic="T extends TableNames">
import type { Clause, ConditionTreeAsArray } from './index.vue'
import { useSortable } from '@vueuse/integrations/useSortable'

type Props = {
  collection: T
  level?: number
}

const clauses = defineModel<ConditionTreeAsArray<T>[]>({
  default: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: ConditionTreeAsArray<T>[]]
}>()

const { level = 0 } = defineProps<Props>()

/**
 * Reference to the template element.
 */
const el = useTemplateRef('el')

useSortable(el, clauses, {
  group: 'clauses',
  onStart(event) {
    if (!isNumber(event.oldIndex)) return
    const clause = JSON.parse(JSON.stringify(toValue(clauses).at(event.oldIndex)))
    Object.assign(event.from, { clause })
  },
  onRemove: event => remove(event.oldIndex),
  // @ts-expect-error - not typed
  onAdd: event => add(event.from.clause, event.newIndex)
})

/**
 * Remove a clause at the specified index.
 */
function remove(index?: number) {
  clauses.value = toValue(clauses).filter((_, i) => i !== index)
}

/**
 * Function add clause at
 */
function add(clause: Clause<T>, index?: number) {
  clauses.value.splice(index ?? clauses.value.length, 0, clause)
}

/**
 * Update the model value when the clause changes.
 */
function updateModelValue() {
  emit('update:modelValue', [...toValue(clauses)])
}
</script>

<template>
  <div
    ref="el"
    class="flex flex-col gap-2 py-4"
  >
    <div
      v-for="(_, index) of clauses"
      :key="level + '-' + index"
      class="flex items-center gap-2"
    >
      <CollectionFilterClause
        v-if="clauses[index]?.type === 'clause'"
        v-model="clauses[index]"
        :collection
        @update:model-value="updateModelValue"
      >
        <UButton
          icon="heroicons:x-mark"
          size="xs"
          color="error"
          :ui="{ base: 'rounded-full' }"
          square
          variant="ghost"
          @click="remove(index)"
        />
      </CollectionFilterClause>

      <CollectionFilterAndOrClause
        v-else-if="clauses[index]"
        v-model="clauses[index]"
        :collection
        :level="level + 1"
        @update:model-value="updateModelValue"
      >
        <UButton
          icon="heroicons:x-mark"
          size="xs"
          color="error"
          :ui="{ base: 'rounded-full' }"
          square
          variant="ghost"
          @click="remove(index)"
        />
      </CollectionFilterAndOrClause>
    </div>
  </div>
</template>
