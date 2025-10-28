<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui'

interface Props extends ButtonProps {
  collection: TableNames
  totalItems: number
  displayedItems: number
}

const { collection, totalItems } = defineProps<Props>()

const { page, limit } = useQueryRouter(collection)
/**
 * Translations
 */
const { t } = useI18n()
</script>

<template>
  <div class="flex justify-center items-center p-4">
    <UPagination
      v-model:page="page"
      data-testid="table-pagination"
      :items-per-page="limit"
      :total="totalItems"
      v-bind="{ variant, size, color }"
    />
    <p class="text-xs ml-6">
      {{ t('app.admin.items-number', { displayedItems, totalItems }, totalItems) }}
    </p>
  </div>
</template>
