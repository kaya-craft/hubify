<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>, V extends Multiple extends false ? string : string | string[], Multiple extends boolean = false">
interface Props {
  options: string[]
  collection: T
  column: C
  multiple?: Multiple
}

const modelValue = defineModel<V>()

defineFieldDataTypes('enum', 'enum-array', 'varchar', 'text', 'json', 'jsonb')

const { options, multiple } = defineProps<Props>()

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

/**
 * Toggle option.
 */
function toggle(optionValue: string) {
  if (multiple) {
    const newValue = (Array.isArray(value.value) ? value.value : []) as string[]

    const index = newValue.indexOf(optionValue)

    if (index === -1) {
      newValue.push(optionValue)
    }
    else {
      newValue.splice(index, 1)
    }

    value.value = newValue as V
  }
  else if (value.value === optionValue) {
    value.value = null
  }
  else {
    value.value = optionValue as V
  }
}

/**
 * Check if option is active.
 */
function isActive(optionValue: string): boolean {
  if (Array.isArray(value.value)) {
    return value.value.includes(optionValue)
  }
  else {
    return value.value === optionValue
  }
}
</script>

<template>
  <UFieldGroup>
    <UButton
      v-for="item of optionItems"
      :key="item.value"
      :label="item.label"
      variant="subtle"
      :color="isActive(item.value) ? 'primary': 'neutral'"
      @click="toggle(item.value)"
    />
  </UFieldGroup>
</template>
