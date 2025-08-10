<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Clause } from './index.vue'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

const column = defineModel<Clause['column']>('column', {
  required: true
})

const operation = defineModel<Clause['operation']>('operation', {
  required: true
})

const value = defineModel<Clause['value']>('value', {
  required: true
})

const { columnNames } = useTable(collection)

const columnItems = computed(() => {
  return toValue(columnNames).map(name => ({
    label: name,
    value: name,
    onSelect: () => {
      column.value = name
    }
  }) satisfies DropdownMenuItem)
})

const operationItems = computed(() => [
  { label: 'Equals', value: '$eq' },
  { label: 'Not Equals', value: '$neq' },
  { label: 'Like', value: '$like' },
  { label: 'Not Like', value: '$nlike' },
  { label: 'Greater Than', value: '$gt' },
  { label: 'Less Than', value: '$lt' },
  { label: 'Greater Than or Equal', value: '$gte' },
  { label: 'Less Than or Equal', value: '$lte' },
  { label: 'In', value: '$in' },
  { label: 'Not In', value: '$nin' }
].map(item => ({
  ...item,
  onSelect: () => {
    operation.value = item.value
  }
})) satisfies DropdownMenuItem[])
</script>

<template>
  <div
    draggable="true"
    tabindex="0"
    class="flex items-center gap-2  w-full"
  >
    <UIcon name="mdi:drag" />
    <UDropdownMenu :items="columnItems">
      <UButton
        :label="column || 'Column'"
        size="sm"
        variant="subtle"
        color="neutral"
      />
    </UDropdownMenu>
    <UDropdownMenu :items="operationItems">
      <UButton
        :label="operation || 'Operation'"
        size="sm"
        color="neutral"
        variant="subtle"
      />
    </UDropdownMenu>
    <UInput
      v-model="value"
      placeholder="Value"
      size="sm"
    />
  </div>
</template>
