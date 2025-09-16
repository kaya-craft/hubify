<script lang="ts" setup>
const { collection, totalCount } = defineProps<{
  collection: TableNames
  totalCount: number
}>()

const { updatePageIndex, pageSize, pageIndex } = usePagination(collection)
</script>

<template>
  <UPagination
    v-model:page="pageIndex"
    data-testid="table-pagination"
    class="flex justify-center p-4 border-t-1 border-slate-600"
    :items-per-page="pageSize"
    :total="totalCount"
    @update:page="(p: number) => updatePageIndex(p)"
  />
</template>
