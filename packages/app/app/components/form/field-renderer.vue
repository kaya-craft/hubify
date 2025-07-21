<script setup lang="ts" generic="T extends keyof Schema, C extends keyof Schema[T]['columns']">
import fields from '#hubify/fields'
import schema from '#hubify/schema'
import type { AsyncComponentLoader } from 'vue'
import InputText from '../fields/input-text.vue'

type Props = {
  table: T & string
  column: C & string
}

const { table, column } = defineProps<Props>()

const component = computed(() => {
  if (table in schema) {
    const tableFields = schema[table]?.fields || {}
    if (column in tableFields) {
      const field = tableFields[column as keyof typeof tableFields] as { component: keyof typeof fields }
      return defineAsyncComponent(fields[field.component] as AsyncComponentLoader)
    }
  }

  return InputText
})
</script>

<template>
  <component
    :is="component"
    v-if="component"
    :key="`${table}-${column}`"
    :table="table"
    :column="column"
  />
</template>
