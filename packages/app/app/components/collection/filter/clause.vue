<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Clause } from './index.vue'
import { getDataTypeGroup, getDataTypeOperators } from '@hubify/api/database/data-types'

type Props = {
  collection: T
}

const { collection } = defineProps<Props>()

const clause = defineModel<Clause<T>>({
  required: true
})

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
 * Current column def.
 */
const column = computed(() => {
  return clause.value.column && getColumn(clause.value.column)
})

/**
 * List of items for the dropdown menu to select an operation.
 */
const operatorItems = computed(() => {
  const type = toValue(column)?.type
  if (!type) return []

  return getDataTypeOperators(type).map(op => ({
    label: t(`app.admin.filters.${op}`),
    value: op
  })) satisfies DropdownMenuItem[]
})

/**
 * Get input type based on column type.
 */
const inputType = computed(() => {
  const type = toValue(column)?.type
  if (!type) return 'text'

  switch (getDataTypeGroup(type)) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'date':
      return 'date'
    case 'json':
      return 'json'
    default:
      return 'text'
  }
})

/**
 * Is in operator.
 */
function isInOperator(clause: Clause<T>) {
  return clause.operator === '$in' || clause.operator === '$nin'
}

/**
 * Is between operator.
 */
function isBetweenOperator(clause: Clause<T>) {
  return clause.operator === '$between' || clause.operator === '$nbetween'
}

/**
 * Is array operator.
 */
function isArrayOperator(clause: Clause<T>) {
  return isInOperator(clause) || isBetweenOperator(clause)
}

/**
 * Is null operator.
 */
function isNullOperator(clause: Clause<T>) {
  return clause.operator === '$null' || clause.operator === '$nnull'
}

/**
 * Check if the clause is a number or string array.
 */
function isClauseIn(clause: Clause<T>): clause is Clause<T> & { value: string[] } {
  return isInOperator(clause) && Array.isArray(clause.value)
}

/**
 * Check if the clause is a number.
 */
function isClauseNumberBetween(clause: Clause<T>): clause is Clause<T> & { value: number[] } {
  return toValue(inputType) === 'number' && isBetweenOperator(clause) && Array.isArray(clause.value)
}

/**
 * Check if the clause is a date array.
 */
function isClauseDateBetween(clause: Clause<T>): clause is Clause<T> & { value: Date[] } {
  return toValue(inputType) === 'date' && isBetweenOperator(clause) && Array.isArray(clause.value)
}

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
 * Ensute proper value type when operator changes.
 */
function ensureProperValueType(value: Clause<T>, oldValue?: Clause<T>) {
  if (value === oldValue) return

  if (isArrayOperator(value) && !Array.isArray(value.value)) {
    value.value = []
  }
  else if (!isArrayOperator(value) && Array.isArray(value.value)) {
    value.value = undefined
  }
  else if (isNullOperator(value)) {
    value.value = true
  }
}

watch(clause, ensureProperValueType, { immediate: true })
</script>

<template>
  <div
    class="flex gap-2 items-center p-2"
  >
    <UIcon
      name="mdi:drag"
      data-handle="true"
      class="cursor-move size-6"
      data-testid="drag-handle"
    />

    <USelect
      v-model="clause.column"
      data-testid="filter-column"
      :label="clause.column || t('app.admin.filters.column')"
      size="xs"
      variant="subtle"
      color="neutral"
      :items="columnItems"
      :ui="{
        content: 'w-max'
      }"
    />

    <USelect
      v-model="clause.operator"
      data-testid="filter-operator"
      :items="operatorItems"
      size="xs"
      variant="subtle"
      :ui="{
        content: 'w-max'
      }"
    />

    <template v-if="!isNullOperator(clause)">
      <template v-if="isClauseIn(clause)">
        <UInputTags
          v-model="clause.value"
          size="sm"
          class="flex-1"
          data-testid="filter-value"
          placeholder="Value"
        />
      </template>

      <template v-else-if="isClauseBoolean(clause)">
        <USwitch
          v-model="clause.value"
          size="xs"
          class="flex-1"
          data-testid="filter-value"
        />
      </template>

      <template v-else-if="isClauseJson(clause)">
        <p>JSON</p>
      </template>

      <template v-else-if="isClauseDateBetween(clause)">
        <InputsDatePicker
          v-model="clause.value"
          size="xs"
          variant="subtle"
          color="neutral"
          :calendar="{ range: true }"
        />
      </template>

      <template v-else-if="isClauseDate(clause)">
        <InputsDatePicker
          v-model="clause.value"
          size="xs"
          variant="subtle"
          color="neutral"
        />
      </template>

      <template v-else-if="isClauseNumberBetween(clause)">
        <UInputNumber
          v-model.number="clause.value[0]"
          size="xs"
          class="flex-1"
          data-testid="filter-value-min"
          :placeholder="t('app.admin.filters.min')"
        />
        <span class="text-sm text-gray-500">-</span>
        <UInputNumber
          v-model.number="clause.value[1]"
          size="xs"
          class="flex-1"
          data-testid="filter-value-max"
          :placeholder="t('app.admin.filters.max')"
        />
      </template>

      <template v-else-if="isClauseNumber(clause)">
        <UInputNumber
          v-model.number="clause.value"
          size="xs"
          class="flex-1"
          data-testid="filter-value"
        />
      </template>

      <template v-else-if="isClauseText(clause)">
        <UInput
          v-model="clause.value"
          placeholder="Value"
          class="flex-1"
          size="xs"
          data-testid="filter-value"
        />
      </template>
    </template>

    <slot />
  </div>
</template>
