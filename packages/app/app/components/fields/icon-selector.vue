<script setup lang="ts">
import type { InputMenuProps } from '@nuxt/ui'

interface Props extends /* @vue-ignore */ InputMenuProps {}

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
 * Props for the icon selector component.
 */
defineProps<Props>()

/**
 * Selected icon
 */
const value = ref('')

/**
 * Search query
 */
const searchQuery = ref('')

/**
 * Debounced search to avoid too many API calls
 */
const debouncedQuery = refDebounced(searchQuery, 300)

/**
 * Pagination state
 */
const page = ref(1)
const numberPerPage = 32
const total = ref(0)

/**
 * Items to display based on selected page
 */
const itemsToDisplay = computed(() => searchResults.value?.slice(page.value, page.value + numberPerPage))

/**
 * Fetch search results from the API
 */
const { data: searchResults, pending } = useFetch('/api/iconify/search', {
  query: {
    query: debouncedQuery,
    limit: 999
  },
  transform: (data: APIv2SearchResponse) => (data.icons) || [],
  onResponse({ response }) {
    total.value = Number(response._data?.total || 0)
  }
})
</script>

<template>
  <USelectMenu
    v-model="value"
    v-model:search-term="searchQuery"
    :items="itemsToDisplay"
    :loading="pending"
    :icon="value"
    :placeholder="$t('app.icon-selector.placeholder')"
    name="Input-Search-Icon"
    :ui="{ group: 'p-1 isolate grid grid-cols-8' }"
    @click.prevent
  >
    <template #item="{ item }">
      <UIcon
        :name="item"
        size="24"
      />
    </template>

    <template #empty>
      <span>{{ $t('app.icon-selector.empty') }}</span>
    </template>

    <template #content-bottom>
      <UPagination
        v-if="total > numberPerPage"
        v-model:page="page"
        :total
        :items-per-page="32"
        :ui="{ list: 'flex items-center gap-1 p-1 justify-center' }"
      />
    </template>
  </USelectMenu>
</template>
