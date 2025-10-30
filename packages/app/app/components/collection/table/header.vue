<script lang="ts" setup generic="T extends TableNames">
import type { ButtonProps, DropdownMenuItem } from '@nuxt/ui'
import type { Column, Row, Table } from '@tanstack/vue-table'

interface Props extends ButtonProps {
  collection: T
  table?: Table<T>
  baseQueryRouter?: QueryParams<T>
  totalCount?: number
}

const { collection, table, baseQueryRouter } = defineProps<Props>()

/**
 * Translations
 */
const { t } = useI18n()

/**
 * Handle table row size
 */
const { limit, where } = useQueryRouter(collection, baseQueryRouter)

/**
 * Collection definition.
 */
const { getPrimaryKeyValue } = useTable(collection)

/**
 * Locale route helper.
 */
const localeRoute = useLocaleRoute()

/**
 * Page sizes options
 */
const pageSizes: DropdownMenuItem[] = [{
  label: '10 items',
  value: 10
}, {
  label: '20 items',
  value: 20
}, {
  label: '50 items',
  value: 50
}, {
  label: '100 items',
  value: 100
}].map(item => ({
  ...item,
  onSelect: () => limit.value = Number(item.value)
}))

/**
 * Handle column visibility
 */
const tableColumnsItems = computed(() => {
  return table?.getAllColumns()
    .filter((column: Column<T>) => column.getCanHide())
    .filter((column: Column<T>) => column.id !== 'select' && column.id !== 'actions')
    .map((column: Column<T>) => ({
      label: String(column.id),
      type: 'checkbox' as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        table?.getColumn(column.id)?.toggleVisibility(!!checked)
      },
      onSelect(e?: Event) {
        e?.preventDefault()
      }
    }) satisfies DropdownMenuItem)
})

/**
 * Selected items
 */
const selectedItems = computed((): TableItem<T>[] => {
  return (table?.getSelectedRowModel().flatRows.map((row: Row<T>) => row.original) ?? []) as TableItem<T>[]
})

/**
 * Selected items primary keys.
 */
const selectedItemsPks = computed(() => {
  return selectedItems.value.map(item => getPrimaryKeyValue(item))
})

/**
 * Disable delete button if no items are selected
 */
const disableDeleteButton = computed(() => {
  return selectedItems.value.length === 0
})
</script>

<template>
  <div class="grid grid-col-1 lg:grid-flow-col gap-2 lg:gap-6 justify-between bg-default sticky top-0 z-10 shrink-0 px-6 py-2">
    <div class="flex gap-4 overflow-x-scroll">
      <!-- Page size -->
      <div data-testid="table-page-size">
        <UDropdownMenu
          :items="pageSizes"
        >
          <UButton
            v-bind="{ size, variant, color }"
            :label="t('app.admin.collection.page-size', { pageSize: limit })"
            icon="lucide:list-ordered"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
      </div>

      <!-- Column visibility -->
      <div data-testid="table-column-visibility">
        <UDropdownMenu
          :items="tableColumnsItems"
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columns"
            v-bind="{ size, variant, color }"
            trailing-icon="i-lucide-chevron-down"
            icon="lucide:columns-3-cog"
          />
        </UDropdownMenu>
      </div>

      <!-- Filter -->
      <CollectionFilter
        v-model="where"
        v-bind="{ size, color, variant }"
        :collection
      />
    </div>

    <div class="flex gap-4 overflow-x-scroll">
      <UButton
        color="error"
        :disabled="disableDeleteButton"
        v-bind="{ size, variant }"
        icon="heroicons:trash"
        :label="t('app.form.actions.delete')"
        :to="localeRoute(`/admin/items/${collection}/remove?items=${selectedItemsPks}`)"
      />

      <UButton
        :to="localeRoute(`/admin/items/${collection}/create`)"
        color="secondary"
        v-bind="{ size, variant }"
        leading-icon="heroicons:plus"
      >
        {{ t('app.admin.items.create') }}
      </UButton>
    </div>
  </div>
</template>
