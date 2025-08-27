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
 * API Iconify base URL
 */
const API_BASE_URL = 'https://api.iconify.design'

/**
 * Computed url for search query
 */
const queryUrl = computed(() => debouncedQuery.value ? `${API_BASE_URL}/search?query=${debouncedQuery.value}` : '')

/**
 * Fetch search results from the API
 */
const { data: searchResults, pending } = await useFetch<APIv2SearchResponse>(queryUrl, {
  method: 'GET',
  default: () => ({ icons: [], total: 0, start: 0, limit: 0 }),
  watch: [debouncedQuery]
})

/**
 * Computed list of icon items
 */
const iconItems = computed(() => searchResults.value?.icons || [])
</script>

<template>
  <div class="w-48">
    <UInputMenu
      v-model="value"
      v-model:search-term="searchQuery"
      :items="iconItems"
      :loading="pending"
      :icon="value"
      placeholder="Search icons..."
      name="Input-Search-Icon"
    >
      <template #item="{ item }">
        <div class="w-full">
          <div class="grid grid-flow-col gap-2 my-2 justify-start items-center">
            <UIcon
              :name="item"
              size="24"
            />
            <span class="text-xs">{{ item }}</span>
          </div>
          <USeparator color="neutral" />
        </div>
      </template>

      <template #empty>
        <span>No icons found</span>
      </template>
    </UInputMenu>
  </div>
</template>
