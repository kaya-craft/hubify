<script setup lang="ts" generic="T extends TableNames">
import type { Operator } from '@hubify/api/database/types'
import type { AndOrClause } from './index.vue'
import type { DropdownMenuItem } from '@nuxt/ui'

export type Clause<T extends TableNames> = {
  type: 'clause'
  column?: TableColumnNames<T>
  operator?: Operator
  value?: unknown
}

export type ConditionTreeAsArray<T extends TableNames> = {
  type: '$and' | '$or'
  children?: ConditionTreeAsArray<T>[]
} | Clause<T>

type Props = {
  collection: T
  canExpand?: boolean
  showDropdown?: boolean
  title?: string
  description?: string
}

const filter = defineModel<ConditionTree<T>, string, ConditionTreeAsArray<T>[], ConditionTreeAsArray<T>[]>({
  get: value => clausesObjectToArray(value || {}),
  set: value => ({ $and: clausesArrayToObject(value) })
})

const fullscreen = defineModel<boolean>('fullscreen')

const { collection, showDropdown, canExpand, title, description } = defineProps<Props>()

const { primaryKey } = useTable(() => collection)

/**
 * Turns an array of clauses into an object suitable for RESTQL queries.
 */
function clausesArrayToObject(clauses: ConditionTreeAsArray<T>[]): ConditionTree<T>[] {
  return clauses.reduce((acc, clause) => {
    if (clause.type === '$and' || clause.type === '$or') {
      return acc.concat({
        [clause.type]: clausesArrayToObject(clause.children ?? []).filter(isNonNullish)
      } as unknown as ConditionTree<T>)
    }
    else if (clause.type === 'clause') {
      return acc.concat({
        [clause.column ?? toValue(primaryKey)]: { [clause.operator ?? '$eq']: clause.value ?? null }
      } as ConditionTree<T>)
    }

    return acc
  }, [] as ConditionTree<T>[])
}

/**
 * Converts a condition tree object into an array of clauses.
 */
function clausesObjectToArray(clauses: ConditionTree<T>, root = true) {
  const array = Object.entries(clauses).flatMap(([key, value], _, array): ConditionTreeAsArray<T>[] => {
    if (root && array.length === 1 && key === '$and') {
      if (!isArray(value)) return []

      return value.flatMap(value => clausesObjectToArray(value, false)) as ConditionTreeAsArray<T>[]
    }

    if (key === '$and' || key === '$or') {
      if (!isArray(value)) return []

      return [{ type: key, children: value.flatMap(value => clausesObjectToArray(value, false)) }] as AndOrClause<T>[]
    }

    return Object.entries(value).flatMap(([operator, value]): ConditionTreeAsArray<T>[] => {
      if (operator === '$and' || operator === '$or') {
        if (Array.isArray(value)) {
          return [{ type: operator, children: value.flatMap(value => clausesObjectToArray(value, false)) }] as AndOrClause<T>[]
        }
        throw new Error(`Expected array for operator ${operator}, but got ${typeof value}`)
      }

      return [{
        type: 'clause',
        column: key,
        operator,
        value
      }] as Clause<T>[]
    })
  })

  return reactive(array) as ConditionTreeAsArray<T>[]
}

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * Add a new filter clause.
 */
function add(type: 'clause' | '$and' | '$or') {
  filter.value ??= []
  filter.value = filter.value.concat({ type })
}

/**
 * Dropdown menu items.
 */
const dropdownItems = computed(() => [
  {
    label: t('app.admin.filters.add-condition'),
    icon: 'heroicons:plus',
    dataTestid: 'add-condition',
    onSelect: () => add('clause')
  },
  {
    label: t('app.admin.filters.add-group'),
    icon: 'heroicons:plus',
    dataTestid: 'add-group',
    onSelect: () => add('$and')
  }
] satisfies DropdownMenuItem[])
</script>

<template>
  <div
    class="flex flex-col gap-4 min-w-md"
  >
    <div class="flex items-center justify-between">
      <div
        class="flex flex-col"
      >
        <h2
          v-if="title"
          class="font-bold"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="text-sm text-gray-500"
        >
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          v-if="canExpand"
          :icon="fullscreen ? 'heroicons:arrows-pointing-in' : 'heroicons:arrows-pointing-out'"
          variant="subtle"
          color="neutral"
          data-testid="toggle-fullscreen"
          @click="fullscreen = !fullscreen"
        />

        <UDropdownMenu
          v-if="showDropdown"
          :items="dropdownItems"
        >
          <UButton
            icon="heroicons:ellipsis-vertical"
            data-testid="filter-options"
            variant="subtle"
            color="neutral"
          />
        </UDropdownMenu>

        <UButton
          v-for="(item, index) of dropdownItems"
          v-else
          :key="index"
          :label="item.label"
          :icon="item.icon"
          variant="subtle"
          size="sm"
          color="neutral"
          @click="item.onSelect()"
        />
      </div>
    </div>

    <p
      v-if="filter?.length === 0"
      class="text-sm text-center border-2 border-dashed text-gray-500 border-gray-400 rounded p-4 select-none"
    >
      {{ t('app.admin.filters.no-filter') }}
    </p>

    <CollectionFilterClauses
      v-else
      v-model="filter"
      :collection
    />
  </div>
</template>
