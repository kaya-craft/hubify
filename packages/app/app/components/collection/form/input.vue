<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
import type { TableFieldOptionValue } from '@hubify/app/types/fields'

type Props = {
  collection: T
  column: C
  state?: TableFormState<T>
}

const value = defineModel<TableFieldOptionValue<T, C>>()

const { collection, column, state } = defineProps<Props>()

const { getInputComponent, getColumnLabel, getInput } = useTableForm(collection)

/**
 * Current input.
 */
const input = computed(() => {
  return getInput(column)
})

/**
 * Component for the current input.
 */
const component = computed(() => {
  return getInputComponent(column)
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <UFormField
    v-if="input !== false"
    :label="getColumnLabel(column)"
    :name="column"
    :class="[$attrs.class?.toString(), input?.class]"
  >
    <component
      :is="component"
      :key="`${collection}-${column}`"
      v-model="value"
      :collection
      :state
      :column
      v-bind="input?.props"
      class="w-full"
    />
  </UFormField>
</template>
