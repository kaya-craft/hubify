<script lang="ts" setup>
const { collection, totalItems } = defineProps<{
  collection: TableNames
  totalItems: number
  displayedItems: number
}>()

/**
 * Pagination
 */
const { updatePageIndex, pagination } = usePagination(collection)

/**
 * Translations
 */
const { t } = useI18n()
</script>

<template>
  <div class="flex justify-center items-center p-4 border-t-1 border-slate-600">
    <UPagination
      v-model:page="pagination.pageIndex"
      data-testid="table-pagination"
      :items-per-page="pagination.pageSize"
      :total="totalItems"
      @update:page="(p: number) => updatePageIndex(p)"
    />
    <p class="text-xs ml-6">
      ({{ t('app.admin.items-number', { displayedItems, totalItems }) }})
    </p>
  </div>
</template>
