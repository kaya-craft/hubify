<script setup lang="ts" generic="T extends TableFormTables, C extends TableFormColumns<T>">
import type { TableFormFieldValue, TableFormState } from '@/composables/useTableForm'

type Props = {
  table: T
  column: C
  state?: TableFormState<T>
}

const value = defineModel<TableFormFieldValue<T, C>>()

const { table, column, state } = defineProps<Props>()

const { getFieldComponent, getField } = useTableForm(table)

/**
 * Current field.
 */
const field = computed(() => {
  return getField(column)
})

/**
 * Component for the current field.
 */
const component = computed(() => {
  return getFieldComponent(column)
})

defineOptions({ inheritAttrs: false })
</script>

<template>
  <UFormField
    v-if="field !== false"
    :label="field?.label || column"
    :name="column"
    :class="[$attrs.class?.toString(), field?.class]"
  >
    <component
      :is="component"
      :key="`${table}-${column}`"
      v-model="value"
      :table
      :state
      :column
      v-bind="field?.props"
      class="w-full"
    />
  </UFormField>
</template>
