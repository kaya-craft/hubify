<script setup lang="ts" generic="T extends TableNames">
import type { ConditionTree } from '@hubify/restql'

export type Clause = {
  type: 'clause'
  column: string
  operation: string
  value: unknown
}

export type ConditionTreeAsArray = {
  type: '$and' | '$or'
  children: ConditionTreeAsArray[]
} | Clause

type Props = {
  collection: T
}

const filter = defineModel<ConditionTree<Schema, T>, string, ConditionTreeAsArray[], ConditionTreeAsArray[]>({
  default: () => ({ }),
  get: clausesObjectToArray,
  set: clausesArrayToObject
})

const { collection } = defineProps<Props>()

/**
 * Turns an array of clauses into an object suitable for RESTQL queries.
 */
function clausesArrayToObject(clauses: ConditionTreeAsArray[]): ConditionTree<Schema, T> | undefined {
  if (clauses.length === 0) return

  return clauses.reduce((acc, clause) => {
    if (clause.type === '$and' || clause.type === '$or') {
      Object.assign(acc, {
        [clause.type]: clause.children.map(child => clausesArrayToObject([child])).filter(isNonNullish)
      })
    }
    else if (clause.type === 'clause') {
      Object.assign(acc, {
        [clause.column]: { [clause.operation]: clause.value }
      })
    }

    return acc
  }, {} as ConditionTree<Schema, T>)
}

/**
 * Converts a condition tree object into an array of clauses.
 */
function clausesObjectToArray(clauses: ConditionTree<Schema, T>): ConditionTreeAsArray[] {
  return Object.entries(clauses).flatMap(([key, value]) => {
    if (key === '$and' || key === '$or') {
      return { type: key, children: value.flatMap(clausesObjectToArray) }
    }

    return Object.entries(value).flatMap(([operation, value]) => {
      if (operation === '$and' || operation === '$or') {
        if (Array.isArray(value)) {
          return { type: operation, children: value.flatMap(clausesObjectToArray) }
        }
        throw new Error(`Expected array for operation ${operation}, but got ${typeof value}`)
      }

      return {
        type: 'clause',
        column: key,
        operation,
        value
      }
    })
  })
}

/**
 * Translation.
 */
const { t } = useI18n()
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
            @click="filter = filter.concat({ type: 'clause', column: '', operation: '$eq', value: '' })"
          />

          <UButton
            :label="t('app.admin.filters.and')"
            size="xs"
            color="info"
            icon="heroicons:plus"
            @click="filter = filter.concat({ type: '$and', children: [] })"
          />

          <UButton
            :label="t('app.admin.filters.or')"
            size="xs"
            color="neutral"
            icon="heroicons:plus"
            @click="filter = filter.concat({ type: '$or', children: [] })"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
