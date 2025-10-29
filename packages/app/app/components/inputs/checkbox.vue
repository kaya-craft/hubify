<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
import type { CheckboxGroupProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ Omit<CheckboxGroupProps, 'items' | 'modelValue'> {
  options: string[]
  collection: T
  column: C
}

const modelValue = defineModel<string | string[]>()

defineFieldDataTypes('enum', 'enum-array', 'varchar', 'text', 'json', 'jsonb')

const { options, collection, column, ...checkboxProps } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * JSON value.
 */
const value = normalizeJSONValue(modelValue)

/**
 * List of options.
 */
const optionItems = computed(() => {
  return options.map(option => ({
    label: t(`options.${option}`, option),
    value: option
  }))
})
</script>

<template>
  <UCheckboxGroup
    v-bind="checkboxProps"
    v-model="value"
    :items="optionItems"
  />
</template>
