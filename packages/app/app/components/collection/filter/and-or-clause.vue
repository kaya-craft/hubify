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

function addClause() {
  children.value = [...children.value, { type: 'clause', column: '', operation: '$eq', value: '' }]
}

function onUpdated(clauses: ConditionTreeAsArray[]) {
  emit('update:model-value', clauses)
}
</script>

<template>
  <div
    draggable="true"
    tabindex="0"
    class="flex flex-col gap-2"
  >
    <div class="flex items-center gap-2">
      <UIcon name="mdi:drag" />
      <USelect
        v-model="type"
        :items="[{ label: 'and', value: '$and' }, { label: 'or', value: '$or' }]"
      />
    </div>
    <div class="pl-2 flex flex-col gap-2">
      <CollectionFilterClauses
        v-model="children"
        :collection
        @update:model-value="onUpdated"
      />
      <UButton
        label="Add Clause"
        size="sm"
        color="neutral"
        class="self-start"
        leading-icon="heroicons:plus"
        @click="addClause"
      />
    </div>
  </div>
</template>
