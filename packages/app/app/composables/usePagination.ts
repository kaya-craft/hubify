export function usePagination(collection: TableNames) {
/**
 * Router query state
 */
  const { queryLimit, queryOffset } = useQueryRouter(collection)

  /**
  * Page size
  */
  const pageSize = queryLimit.value ? queryLimit as Ref<number> : useLocalStorage(`hubify.collection.${collection}.limit`, 10)

  /**
  * Page index
  */
  const pageIndex = computed(() => {
    if (!queryOffset.value) return 1

    const index = Math.ceil((queryOffset.value ?? 0) / (pageSize.value ?? 10))

    if (index < 1) return 1
    return index
  })

  /**
  * Pagination state
  */
  const pagination = ref({
    pageIndex: pageIndex.value,
    pageSize: pageSize.value
  })

  function updatePageIndex(newPageIndex: number) {
    pagination.value.pageIndex = newPageIndex
    queryOffset.value = newPageIndex * pageSize.value || undefined
  }

  function updatePageSize(newPageSize: number) {
    pageSize.value = newPageSize
    queryLimit.value = newPageSize
  }

  return {
    pagination,
    pageSize,
    pageIndex,
    updatePageIndex,
    updatePageSize
  }
}
