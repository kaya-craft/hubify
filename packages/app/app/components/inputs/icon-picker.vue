<script setup lang="ts">
import type { InputMenuProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputMenuProps {
  limit?: number
}

export interface APIv2SearchResponse {
  icons: string[]
  total: number
  limit: number
  start: number
}

/**
 * Expose the data types supported by the icon selector.
 */
defineFieldDataTypes('text', 'varchar')

/**
 * Selected icon
 */
const value = defineModel<string>()

/**
 * Props for the icon selector component.
 */
const { limit = 27 } = defineProps<Props>()

/**
 * Search query
 */
const searchQuery = ref('')

/**
 * Debounced search to avoid too many API calls
 */
const query = refDebounced(searchQuery, 300)

/**
 * Pagination state
 */
const page = ref(1)

/**
 * Fetch search results from the API
 */
const { data, pending } = useFetch<APIv2SearchResponse>('/api/iconify/search', {
  query: {
    query,
    limit: 999
  }
})

/**
 * Items to display based on selected page
 */
const items = computed(() => {
  const offset = (toValue(page) - 1) * limit
  return toValue(data)?.icons.slice(offset, offset + limit)
})

/**
 * Translation.
 */
const { t } = useI18n()
</script>

<template>
  <USelectMenu
    v-model="value"
    v-model:search-term="searchQuery"
    :items="items"
    :loading="pending"
    :icon="value"
    :placeholder="t('app.icon-selector.placeholder')"
    :ui="{
      group: 'p-1 isolate flex flex-wrap justify-center gap-2',
      item: 'justify-center w-min shrink',
      empty: [!query ? 'hidden' : '']
    }"
  >
    <template #item="{ item }">
      <UIcon
        :name="item"
        size="24"
      />
    </template>

    <template #empty>
      <span>{{ t('app.icon-selector.empty') }}</span>
    </template>

    <template #content-bottom>
      <UPagination
        v-if="data && data.total > limit"
        v-model:page="page"
        :total="data.total"
        :items-per-page="limit"
        size="sm"
        variant="ghost"
        class="my-2"
        :ui="{ list: 'flex items-center gap-1 p-1 justify-center' }"
      />
    </template>
  </USelectMenu>
</template>
