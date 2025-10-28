<script setup lang="ts" generic="T extends TableNames, C extends TableColumnNames<T>">
import type { SelectProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ SelectProps {
  options: string[]
  collection: T
  column: C
  placeholder?: string
}

const value = defineModel<string>()

defineFieldDataTypes('enum', 'varchar')
defineOptions({ inheritAttrs: false })

const { options, placeholder = 'app.select.placeholder' } = defineProps<Props>()

/**
 * Translation.
 */
const { t } = useI18n()

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
    :placeholder="t(placeholder)"
    :items="optionItems"
  />
</template>
