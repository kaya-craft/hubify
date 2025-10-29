<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>, V extends Multiple extends false ? string : string | string[], Multiple extends boolean = false">
import type { SelectProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ Omit<SelectProps, 'multiple'> {
  options: string[]
  collection: T
  column: C
  placeholder?: string
  multiple: Multiple
}

const modelValue = defineModel<V>()

defineFieldDataTypes('enum', 'enum-array', 'varchar', 'text', 'json', 'jsonb')
defineOptions({ inheritAttrs: false })

const { multiple, options, placeholder = 'app.select.placeholder' } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * JSON value.
 */
const value = normalizeJSONValue(modelValue, () => multiple)

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
  <USelect
    v-model="value"
    :multiple
    :placeholder="t(placeholder)"
    :items="optionItems"
  />
</template>
