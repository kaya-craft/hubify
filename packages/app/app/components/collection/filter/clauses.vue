<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTreeAsArray } from './index.vue'
import { useSortable } from '@vueuse/integrations/useSortable'

type Props = {
  collection: T
}

const clauses = defineModel<ConditionTreeAsArray[]>({
  required: true
})

const emit = defineEmits<{
  'update:model-value': [ConditionTreeAsArray[]]
}>()

function updateChildren(index: number, clause: ConditionTreeAsArray) {
  clauses.value.splice(index, 1, clause)
  emit('update:model-value', clauses.value)
}

function updateColumn(index: number, column: string) {
  const clause = clauses.value[index]
  clause.column = column
  emit('update:model-value', clauses.value)
}

function updateOperation(index: number, operation: string) {
  const clause = clauses.value[index]
  clause.operation = operation
  emit('update:model-value', clauses.value)
}

function updateValue(index: number, value: unknown) {
  const clause = clauses.value[index]
  clause.value = value
  emit('update:model-value', clauses.value)
}

/**
 * Remove clause at the specified index.
 */
function removeClause(index: number) {
  clauses.value.splice(index, 1)
  emit('update:model-value', clauses.value)
}

/**
 * Translation.
 */
const { t } = useI18n()

defineProps<Props>()

const el = useTemplateRef('el')

useSortable(el, clauses, {
  group: {
    pull: true,
    put: true
  },
  animation: 250,
  forceFallback: true

})
</script>

<template>
  <div
    ref="el"
    class="flex flex-col gap-2"
  >
    <div
      v-for="(clause, index) in clauses"
      :key="index"
      class="flex items-center gap-2"
    >
      <CollectionFilterClause
        v-if="clause.type === 'clause'"
        v-model:column="clause.column"
        v-model:operation="clause.operation"
        v-model:value="clause.value"
        :collection="collection"
        @update:column="updateColumn(index, $event)"
        @update:operation="updateOperation(index, $event)"
        @update:value="updateValue(index, $event)"
      >
        <UButton
          icon="heroicons:x-mark"
          size="xs"
          color="error"
          :ui="{ base: 'rounded-full' }"
          square
          variant="ghost"
          @click="removeClause(index)"
        />
      </CollectionFilterClause>

      <CollectionFilterAndOrClause
        v-else
        v-model:children="clause.children"
        v-model:type="clause.type"
        :collection="collection"
        @update:children="updateChildren(index, clause)"
        @update:type="updateChildren(index, clause)"
      >
        <UButton
          icon="heroicons:x-mark"
          size="xs"
          color="error"
          :ui="{ base: 'rounded-full' }"
          square
          variant="ghost"
          @click="removeClause(index)"
        />
      </CollectionFilterAndOrClause>
    </div>
  </div>
</template>
