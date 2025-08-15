<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTree, Operator } from '@hubify/restql'

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
}

const filter = defineModel<ConditionTree<Schema, T>, string, ConditionTreeAsArray<T>[], ConditionTreeAsArray<T>[]>({
  default: () => ({}),
  get: value => clausesObjectToArray(value),
  set: value => ({ $and: clausesArrayToObject(value) })
})

const { collection } = defineProps<Props>()

const { primaryKey } = useTable(collection)

/**
 * Turns an array of clauses into an object suitable for RESTQL queries.
 */
function clausesArrayToObject(clauses: ConditionTreeAsArray<T>[]): ConditionTree<Schema, T>[] {
  return clauses.reduce((acc, clause) => {
    if (clause.type === '$and' || clause.type === '$or') {
      return acc.concat({
        [clause.type]: clausesArrayToObject(clause.children ?? []).filter(isNonNullish)
      } as ConditionTree<Schema, T>)
    }
    else if (clause.type === 'clause') {
      return acc.concat({
        [clause.column ?? toValue(primaryKey)]: { [clause.operator ?? '$eq']: clause.value ?? null }
      } as ConditionTree<Schema, T>)
    }

    return acc
  }, [] as ConditionTree<Schema, T>[])
}

/**
 * Converts a condition tree object into an array of clauses.
 */
function clausesObjectToArray(clauses: ConditionTree<Schema, T>, root = true): ConditionTreeAsArray<T>[] {
  return Object.entries(clauses).flatMap(([key, value], _, array) => {
    if (root && array.length === 1 && key === '$and') {
      return value.flatMap(value => clausesObjectToArray(value, false))
    }

    if (key === '$and' || key === '$or') {
      return { type: key, children: value.flatMap(value => clausesObjectToArray(value, false)) }
    }

    return Object.entries(value).flatMap(([operator, value]) => {
      if (operator === '$and' || operator === '$or') {
        if (Array.isArray(value)) {
          return { type: operator, children: value.flatMap(value => clausesObjectToArray(value, false)) }
        }
        throw new Error(`Expected array for operator ${operator}, but got ${typeof value}`)
      }

      return {

        type: 'clause',
        column: key,
        operator,
        value
      } as Clause<T>
    })
  })
}

/**
 * Translation.
 */
const { t } = useI18n()

/**
 * Add a new filter clause.
 */
function add(type: 'clause' | '$and' | '$or') {
  filter.value = filter.value.concat({
    type
  })
}
</script>

<template>
  <UPopover>
    <UButton label="Filter" />

    <template #content>
      <div class="flex flex-col gap-4 p-4">
        <p
          v-if="filter.length === 0"
          class="text-sm text-gray-500 text-center"
        >
          {{ t('app.admin.filters.no-filter') }}
        </p>

        <CollectionFilterClauses
          v-else
          v-model="filter"
          :collection
        />

        <div class="flex items-center justify-center gap-2">
          <UButton
            :label="t('app.admin.filters.add-clause')"
            size="xs"
            color="primary"
            icon="heroicons:plus"
            @click="add('clause')"
          />

          <UButton
            :label="t('app.admin.filters.and')"
            size="xs"
            color="info"
            icon="heroicons:plus"
            @click="add('$and')"
          />

          <UButton
            :label="t('app.admin.filters.or')"
            size="xs"
            color="neutral"
            icon="heroicons:plus"
            @click="add('$or')"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
