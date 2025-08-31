<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Clause } from './index.vue'
import { columnTypeToOperators } from '@hubify/api/lib/column-types'

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
  const type = toValue(column)
  if (!type) return []
  return columnTypeToOperators(type).map(op => ({
    label: t(`app.admin.filters.${op}`),
    value: op
  })) satisfies DropdownMenuItem[]
})

/**
 * Get input type based on column type.
 */
const inputType = computed(() => {
  switch (toValue(column)?.type) {
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

    <template v-if="isClauseBoolean(clause)">
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

    <template v-else-if="isClauseDate(clause)">
      <!-- <UCalendar
          v-model="clause.value"
          size="xs"
          class="flex-1"
          data-testid="filter-value"
        /> -->
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

    <slot />
  </div>
</template>
