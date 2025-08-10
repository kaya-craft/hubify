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
  default: () => ({ $and: [] }),
  get(value) {
    return clausesAsArray(value)
  },
  set(value) {
    return clausesArrayToObject(value)
  }
})

const { collection } = defineProps<Props>()

function clausesArrayToObject(clauses: ConditionTreeAsArray[]): ConditionTree<Schema, T> | undefined {
  if (clauses.length === 0) return

  return clauses.reduce((acc, clause) => {
    if (clause.type === '$and' || clause.type === '$or') {
      acc[clause.type] = clause.children.map(child => clausesArrayToObject([child]))
    }
    else if (clause.type === 'clause') {
      acc[clause.column] = { [clause.operation]: clause.value }
    }
    return acc
  }, {} as ConditionTree<Schema, T>)
}

function clausesAsArray(clauses: ConditionTree<Schema, T>): ConditionTreeAsArray[] {
  return Object.entries(clauses).flatMap(([key, value]) => {
    if (key === '$and' || key === '$or') {
      return { type: key, children: value.flatMap(clausesAsArray) }
    }

    return Object.entries(value).flatMap(([operation, value]) => {
      if (operation === '$and' || operation === '$or') {
        if (Array.isArray(value)) {
          return { type: operation, children: value.flatMap(clausesAsArray) }
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
</script>

<template>
  <UPopover>
    <UButton label="Filter" />

    <template #content>
      <div class="flex flex-col gap-2 p-2">
        <div class="flex items-center gap-2 mb-3">
          <UButton
            size="sm"
            color="info"
            variant="subtle"
            @click="filter = filter.concat({ type: '$and', children: [] })"
          >
            And
          </UButton>
          <UButton
            size="sm"
            color="warning"
            variant="subtle"
            @click="filter = filter.concat({ type: '$or', children: [] })"
          >
            Or
          </UButton>
        </div>

        <CollectionFilterClauses
          v-model="filter"
          :collection
        />
      </div>
    </template>
  </UPopover>
</template>
