<script setup lang="ts" generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Clause } from './index.vue'
import { columnTypeToOperators } from '@hubify/api/lib/column-types'
import type { ZonedDateTime } from '@internationalized/date'
import { fromDate } from '@internationalized/date'

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
 * To Calendar Date.
 */
function toCalendarDate(value?: Date) {
  if (!value) return
  return fromDate(new Date(value), 'UTC')
}

/**
 * From Calendar Date.
 */
function fromCalendarDate(value?: ZonedDateTime) {
  if (!value) return
  const date = value.toDate()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().split('T')[0]
}

/**
 * To date string.
 */
function toDateString(value?: ZonedDateTime | { start?: ZonedDateTime, end?: ZonedDateTime }): string | undefined {
  if (!value) return

  if ('toDate' in value) {
    return value.toDate().toLocaleDateString()
  }
  else if (value.start && value.end) {
    return `${toDateString(value.start)} - ${toDateString(value.end)}`
  }
}

/**
 * Value as calendar date.
 */
const valueAsCalendarDate = computed({
  get() {
    if (!isClauseDate(clause.value) || !clause.value.value) return
    return toCalendarDate(clause.value.value)
  },
  set(value) {
    clause.value.value = fromCalendarDate(value)
  }
})

/**
 * Value as calendar date range.
 */
const valueAsCalendarDateRange = computed({
  get() {
    if (!isClauseDateBetween(clause.value) || !Array.isArray(clause.value.value)) return

    return {
      start: toCalendarDate(clause.value.value[0]),
      end: toCalendarDate(clause.value.value[1])
    }
  },
  set(value) {
    clause.value.value = [fromCalendarDate(value?.start), fromCalendarDate(value?.end)]
  }
})

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
        <UPopover>
          <UButton
            size="xs"
            class="flex-1"
            variant="subtle"
            color="neutral"
            data-testid="filter-value"
          >
            {{ toDateString(valueAsCalendarDateRange) || t('app.admin.filters.select-a-date-range') }}
          </UButton>

          <template #content>
            <UCalendar
              v-model="valueAsCalendarDateRange"
              range
              size="xs"
              class="flex-1"
              color="neutral"
              data-testid="filter-value"
            />
          </template>
        </UPopover>
      </template>

      <template v-else-if="isClauseDate(clause)">
        <UPopover>
          <UButton
            size="xs"
            class="flex-1"
            variant="subtle"
            color="neutral"
            data-testid="filter-value"
          >
            {{ toDateString(valueAsCalendarDate) || t('app.admin.filters.select-a-date') }}
          </UButton>

          <template #content>
            <UCalendar
              v-model="valueAsCalendarDate"
              size="xs"
              class="flex-1"
              data-testid="filter-value"
            />
          </template>
        </UPopover>
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
