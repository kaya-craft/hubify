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

const filter = defineModel<ConditionTree<Schema, T>>()

const { collection } = defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <UPopover>
    <UButton :label="t('app.admin.filters.label')" />

    <template #content>
      <CollectionFilterContent
        v-model="filter"
        :collection
      />
    </template>
  </UPopover>
</template>
