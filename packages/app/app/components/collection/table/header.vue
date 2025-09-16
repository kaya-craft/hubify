<script lang="ts" setup generic="T extends TableNames">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Column, Table } from '@tanstack/vue-table'

const { collection, disableDeleteButton, table } = defineProps<{
  collection: T
  selected?: TableItem<T>[]
  table?: Table<T>
  disableDeleteButton?: boolean
}>()

const emits = defineEmits<{
  'delete-items': []
  'update:page-size': [pageSize: number]
}>()

const { updatePageSize, pageSize } = usePagination(collection)

const globalFilter = defineModel<string>('global-filter')
const queryWhere = defineModel<Where<T>>('query-where')

/**
 * Collection meta data from hubify_collections
 */
const { getCollectionMeta } = useCollections()
const collectionMeta = getCollectionMeta(collection)

/**
 * Collection icon component
 */
const { getDisplayComponent: getHubifyDisplayComponent } = useTable('hubify_collections')
const collectionIconComponent = h(getHubifyDisplayComponent('icon'), { value: collectionMeta?.icon })

function handleUpdatePageSize(newPageSize: number) {
  updatePageSize(newPageSize)
  emits('update:page-size', newPageSize)
}

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
  onSelect: () => handleUpdatePageSize(item.value as number)
}))

/**
 * Table columns items for the column visibility dropdown.
 */
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

/**
 * Delete modal state
 */
const deleteModalOpen = ref(false)

function deleteItems() {
  emits('delete-items')
  deleteModalOpen.value = false
}
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
        :style="`color: ${collectionMeta?.color}`"
      />
    </template>

    <template #title>
      <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <h2
          :style="`color: ${collectionMeta?.color}`"
          class="text-lg font-semibold capitalize"
        >
          {{ collection }}
        </h2>
        <UInput
          v-model="globalFilter"
          data-testid="global-filter"
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
        <div data-testid="table-page-size">
          <UDropdownMenu
            :items="pageSizes"
          >
            <UButton
              color="neutral"
              variant="outline"
              :label="`${pageSize} items`"
            />
          </UDropdownMenu>
        </div>

        <!-- Filters -->
        <CollectionFilter
          v-model="queryWhere"
          :collection
        />

        <!-- Column visibility -->
        <div data-testid="column-visibility">
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
        <!-- Delete -->
        <UModal
          v-model:open="deleteModalOpen"
          title="Are you sure to delete the selected items ?"
        >
          <UButton
            :disabled="disableDeleteButton"
            color="error"
            variant="outline"
            icon="heroicons:trash"
          />

          <template #body>
            <div class="flex justify-between">
              <UButton
                color="error"
                variant="outline"
                icon="heroicons:trash"
                label="Confirm delete"
                @click="deleteItems"
              />

              <UButton
                color="neutral"
                variant="outline"
                label="Cancel"
              />
            </div>
          </template>
        </UModal>
      </div>
    </template>
  </UDashboardNavbar>
</template>
