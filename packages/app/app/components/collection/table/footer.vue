<script lang="ts" setup>
const { collection, totalItems } = defineProps<{
  collection: TableNames
  totalItems: number
  displayedItems: number
}>()

const { page, limit } = useQueryRouter(collection)

/**
 * Translations
 */
const { t } = useI18n()
</script>

<template>
  <div class="flex justify-center items-center p-4 border-t border-slate-600">
    <UPagination
      v-model:page="page"
      data-testid="table-pagination"
      :items-per-page="limit"
      :total="totalItems"
    />
    <p class="text-xs ml-6">
      ({{ t('app.admin.items-number', { displayedItems, totalItems }) }})
    </p>
  </div>
</template>
