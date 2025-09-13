<script lang="ts" setup generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Column, Table } from '@tanstack/vue-table'

const { collection, selected, table } = defineProps<{
  collection: T
  selected: TableItem<T>[]
  table: Table<T>
}>()

const globalFilter = defineModel<string>('global-filter')
const queryWhere = defineModel<Where<T>>('query-where')
const pageSize = defineModel<number>('page-size')

/**
 * Get current collection from hubify_collections
 */
const { currentCollection } = useCollections()

/**
 * Display Icon component from hubify_collections icon field
 */
const { getDisplayComponent: getHubifyDisplayComponent } = useTable('hubify_collections')
const collectionIconComponent = h(getHubifyDisplayComponent('icon'), { value: currentCollection?.value?.icon })

/**
 * Delete items
 */
const itemsToDelete = computed(() => toValue(selected)?.map(s => s.id))

/**
 * Pagination
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
  onSelect: () => updatePagination(item.value as number)
}))

function updatePagination(newPageSize: number) {
  pageSize.value = newPageSize
  table.value?.tableApi.setPageSize(newPageSize)
}

const tableColumnsItems = computed<DropdownMenuItem[]>(() => {
  return table
    ?.getAllColumns()
    .filter((column: Column<T>) => column.getCanHide())
    .filter((column: Column<T>) => column.id !== 'select' && column.id !== 'actions')
    .map((column: Column<T>) => ({
      label: column.id,
      type: 'checkbox' as const,
      checked: column.getIsVisible(),
      onUpdateChecked(checked: boolean) {
        table?.getColumn(column.id)?.toggleVisibility(!!checked)
      },
      onSelect(e?: Event) {
        e?.preventDefault()
      }
    }))
})
</script>

<template>
  <UDashboardNavbar>
    <template #leading>
      <slot
        name="prepend-header"
      />
      <component
        :is="collectionIconComponent"
        v-if="collectionIconComponent"
        :style="`color: ${currentCollection?.color}`"
      />
    </template>

    <template #title>
      <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <h2
          :style="`color: ${currentCollection?.color}`"
          class="text-lg font-semibold capitalize"
        >
          {{ collection }}
        </h2>
        <UInput
          v-model="globalFilter"
          placeholder="Search ..."
        />
      </div>
    </template>

    <template #right>
      <div class="flex flex-row gap-6">
        <slot
          name="append-header"
        />
        <!-- Page size -->
        <UDropdownMenu
          :items="pageSizes"
          @update:model-value="emit('update:page-size', $event)"
        >
          <UButton
            color="neutral"
            variant="outline"
            :label="`${pageSize} items`"
          />
        </UDropdownMenu>

        <!-- Filters -->
        <CollectionFilter
          v-model="queryWhere"
          :collection
        />

        <!-- Delete -->
        <!-- <UButton
          :disabled="!itemsToDelete.length"
          color="error"
          variant="outline"
          icon="heroicons:trash"
          :loading="status === 'pending'"
          @click="deleteItems(itemsToDelete)"
        /> -->

        <!-- Column visibility -->
        <UDropdownMenu
          :items="tableColumnsItems"
          :content="{ align: 'end' }"
        >
          <UButton
            label="Columns"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-chevron-down"
          />
        </UDropdownMenu>
      </div>
    </template>
  </UDashboardNavbar>
</template>
