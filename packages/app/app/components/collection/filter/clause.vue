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

const { columnNames, columns } = useTable(collection)

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
    class="flex gap-2 items-center w-full"
  >
    <div class="flex gap-2 items-center rounded bg-gray-200 p-1.5 w-full">
      <UIcon name="mdi:drag" />

      <USelect
        v-model="column"
        :label="column || 'Column'"
        size="xs"
        variant="subtle"
        color="neutral"
        :items="columnItems"
      />

      <USelect
        v-model="operation"
        :items="operationItems"
        size="xs"
        variant="subtle"
      />

      <UInput
        v-model="value"
        placeholder="Value"
        class="flex-1"
        :type="columns[column]?.type === 'integer' ? 'number' : 'text'"
        size="xs"
      />

      <slot />
    </div>
  </div>
</template>
