<script setup lang="ts" generic="Model extends Range extends true ? (string | Date)[] : (string | Date), Range extends boolean = false">
import { fromDate, type ZonedDateTime } from '@internationalized/date'
import type { ButtonProps, CalendarProps, InputProps, PopoverProps } from '@nuxt/ui'

interface Props {
  calendar?: CalendarProps<Range, true>
  popover?: PopoverProps
  size?: InputProps['size'] & ButtonProps['size']
  variant?: InputProps['variant'] & ButtonProps['variant']
  color?: InputProps['color'] & ButtonProps['color']
}

const { calendar, popover, size, variant, color } = defineProps<Props>()

const value = defineModel<Model>()

defineFieldDataTypes('date', 'timestamp', 'datetime')

/**
 * To Calendar Date.
 */
function toCalendarDate(value?: string | Date) {
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
 * Is range value.
 */
function isValueRange(_value: unknown): _value is (string | Date)[] {
  return calendar?.range === true
}

/**
 * Is calendar for range.
 */
function isCalendarForRange(_calendar: unknown): _calendar is CalendarProps<true> {
  return isValueRange(value.value)
}

/**
 * Is calendar for date.
 */
function isCalendarForDate(_calendar: unknown): _calendar is CalendarProps<false> {
  return !isValueRange(value.value)
}

/**
 * Value as calendar date.
 */
const valueAsCalendarDate = computed({
  get() {
    if (isValueRange(value.value)) return
    return toCalendarDate(value.value)
  },
  set(date) {
    value.value = fromCalendarDate(date) as Model
  }
})

/**
 * Value as calendar date range.
 */
const valueAsCalendarDateRange = computed({
  get() {
    if (!isValueRange(value.value)) return

    return {
      start: toCalendarDate(value.value?.[0]),
      end: toCalendarDate(value.value?.[1])
    }
  },
  set(range) {
    value.value = [fromCalendarDate(range?.start), fromCalendarDate(range?.end)] as Model
  }
})

/**
 * Create a locale date regex
 */
const localeDateRegex = computed(() => {
  const formatObj = new Intl.DateTimeFormat().formatToParts(new Date())

  const value = formatObj
    .map((obj) => {
      switch (obj.type) {
        case 'day':
          return '(?<day>\\d{1,2})'
        case 'month':
          return '(?<month>\\d{1,2})'
        case 'year':
          return '(?<year>\\d{4})'
        default:
          return obj.value
      }
    })
    .join('')

  return new RegExp(`^${value}$`)
})

/**
 * On input.
 */
function onInput(dateString?: string) {
  if (isValueRange(value.value) || !dateString || !toValue(localeDateRegex).test(dateString)) return
  const parts = dateString.match(toValue(localeDateRegex))
  if (!parts) return
  const { day, month, year } = parts.groups as { day: string, month: string, year: string }
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  value.value = fromCalendarDate(toCalendarDate(date)) as Model
}

/**
 * Placeholder.
 */
const placeholder = computed(() => {
  return calendar?.range ? t('app.admin.filters.select-a-date-range') : t('app.admin.filters.select-a-date')
})

/**
 * Translation.
 */
const { t } = useI18n()
</script>

<template>
  <UPopover
    v-if="isCalendarForRange(calendar)"
    v-bind="popover"
  >
    <UButton
      :variant
      :size
      :color
    >
      {{ toDateString(valueAsCalendarDateRange) || placeholder }}
    </UButton>

    <template #content>
      <UCalendar
        v-bind="calendar"
        v-model="valueAsCalendarDateRange"
        :variant
        :size
        :color
        range
      />
    </template>
  </UPopover>

  <UInput
    v-else-if="isCalendarForDate(calendar)"
    :model-value="toDateString(valueAsCalendarDate)"
    :placeholder="placeholder"
    :variant
    :size
    :color
    @update:model-value="onInput($event)"
  >
    <template #trailing>
      <UPopover
        v-bind="popover"
      >
        <UButton
          icon="heroicons:calendar"
          variant="link"
          :size
          :color
          :aria-label="t('app.admin.filters.select-a-date')"
        />

        <template #content>
          <UCalendar
            v-bind="calendar"
            v-model="valueAsCalendarDate"
            :variant
            :size
            :color
            :range="false"
          />
        </template>
      </UPopover>
    </template>
  </UInput>
</template>
