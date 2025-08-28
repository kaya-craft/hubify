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
 * Fetch search results from the API
 */
const { data: searchResults, pending } = await useFetch('/api/iconify/search', {
  query: { query: debouncedQuery },
  transform: (data: APIv2SearchResponse) => data.icons || []
})
</script>

<template>
  <UInputMenu
    v-model="value"
    v-model:search-term="searchQuery"
    :items="searchResults"
    :loading="pending"
    :icon="value"
    :placeholder="$t('app.icon-selector.placeholder')"
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
      <span>{{ $t('app.icon-selector.empty') }}</span>
    </template>
  </UInputMenu>
</template>
