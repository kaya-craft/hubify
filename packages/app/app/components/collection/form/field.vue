<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
type Props = {
  collection: T
  column: C
  state?: TableFormState<T>
}

const value = defineModel<TableColumnOptionValue<T, C>>()

const { collection, column, state } = defineProps<Props>()

const { getFieldComponent, getField } = useTableForm(collection)

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
      :key="`${collection}-${column}`"
      v-model="value"
      :collection
      :state
      :column
      v-bind="field?.props"
      class="w-full"
    />
  </UFormField>
</template>
