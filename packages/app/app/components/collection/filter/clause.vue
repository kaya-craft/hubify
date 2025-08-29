<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Clause } from './index.vue'
import { OPERATORS } from '@hubify/restql/utils/helpers'
import type { Operator } from '@hubify/restql'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

const clause = defineModel<Clause<T>>({
  required: true
})

const emit = defineEmits<{
  'update:modelValue': [Clause<T>]
}>()

/**
 * Tabloe information.
 */
const { columnNames, getColumn } = useTable(collection)

/**
 * List of items for the dropdown menu to select a column.
 */
const columnItems = computed(() => {
  return toValue(columnNames).map(name => ({
    label: name,
    value: name as TableColumnNames<T>
  }) satisfies DropdownMenuItem)
})

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * All available operators.
 */
const operators = computed(() => {
  return Object.keys(OPERATORS).map(op => ({
    label: t(`app.admin.filters.${op}`),
    value: op as Operator
  }))
})

/**
 * List of items for the dropdown menu to select an operation.
 */
const operatorItems = computed(() => {
  switch (toValue(inputType)) {
    case 'checkbox':
      return toValue(operators).filter(op => ['$eq', '$neq'].includes(op.value))
    case 'json':
      return toValue(operators).filter(op => ['$eq', '$neq', '$like', '$nlike'].includes(op.value))
    default:
      return toValue(operators)
  }
})

/**
 * Get input type based on column type.
 */
const inputType = computed(() => {
  const type = clause.value.column && getColumn(clause.value.column)?.type

  switch (type) {
    case 'integer':
    case 'float4':
    case 'numeric':
    case 'int8':
    case 'int4':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'date':
    case 'timestamp':
    case 'timestamptz':
      return 'date'
    case 'json':
      return 'json'
    case 'text':
    case 'varchar':
    default:
      return 'text'
  }
})

/**
 * Check if the clause is a number.
 */
function isClauseNumber(_clause: Clause<T>): _clause is Clause<T> & { value: number } {
  return toValue(inputType) === 'number'
}

/**
 * Check if the clause is a boolean.
 */
function isClauseBoolean(_clause: Clause<T>): _clause is Clause<T> & { value: boolean } {
  return toValue(inputType) === 'checkbox'
}

/**
 * Check if the clause is a date.
 */
function isClauseDate(_clause: Clause<T>): _clause is Clause<T> & { value: Date } {
  return toValue(inputType) === 'date'
}

/**
 * Check if the clause is a JSON object.
 */
function isClauseJson(_clause: Clause<T>): _clause is Clause<T> & { value: Record<string, unknown> } {
  return toValue(inputType) === 'json'
}

/**
 * Check if the clause is a text input.
 */
function isClauseText(_clause: Clause<T>): _clause is Clause<T> & { value: string } {
  return toValue(inputType) === 'text'
}

/**
 * Update the model value when the clause changes.
 */
function updateModelValue() {
  emit('update:modelValue', { ...toValue(clause) })
}
</script>

<template>
  <div
    ref="element"
    class="flex gap-2 items-center w-full"
  >
    <div class="flex gap-2 items-center rounded bg-gray-200 p-1.5 w-full">
      <UIcon
        name="mdi:drag"
        class="drag-handle cursor-move"
      />
      <USelect
        v-model="clause.column"
        :label="clause.column || t('app.admin.filters.column')"
        size="xs"
        variant="subtle"
        color="neutral"
        :items="columnItems"
        :ui="{
          content: 'w-max'
        }"
        @update:model-value="updateModelValue"
      />
      <USelect
        v-model="clause.operator"
        :items="operatorItems"
        size="xs"
        variant="subtle"
        :ui="{
          content: 'w-max'
        }"
        @update:model-value="updateModelValue"
      />

      <template v-if="isClauseBoolean(clause)">
        <USwitch
          v-model="clause.value"
          size="xs"
          class="flex-1"
          @update:model-value="updateModelValue"
        />
      </template>
      <template v-else-if="isClauseJson(clause)">
        <p>JSON</p>
      </template>
      <template v-else-if="isClauseDate(clause)">
        <UDatePicker
          v-model="clause.value"
          size="xs"
          class="flex-1"
          @update:model-value="updateModelValue"
        />
      </template>
      <template v-else-if="isClauseNumber(clause)">
        <UInputNumber
          v-model="clause.value"
          size="xs"
          class="flex-1"
          @update:model-value="updateModelValue"
        />
      </template>
      <template v-else-if="isClauseText(clause)">
        <UInput
          v-model="clause.value"
          placeholder="Value"
          class="flex-1"
          size="xs"
          @update:model-value="updateModelValue"
        />
      </template>

      <slot />
    </div>
  </div>
</template>
