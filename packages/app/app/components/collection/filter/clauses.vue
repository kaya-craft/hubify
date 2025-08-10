<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTreeAsArray } from './index.vue'

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

defineProps<Props>()
</script>

<template>
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
    />

    <CollectionFilterAndOrClause
      v-else
      v-model:children="clause.children"
      v-model:type="clause.type"
      :collection="collection"
      @update:children="updateChildren(index, clause)"
      @update:type="updateChildren(index, clause)"
    />

    <UButton
      icon="heroicons:trash"
      size="sm"
      color="error"
      class="ml-auto self-start"
      @click="clauses.splice(index, 1); emit('update:model-value', clauses)"
    />
  </div>
</template>
