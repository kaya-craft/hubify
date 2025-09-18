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
  const pageIndex = computed({
    get() {
      if (!queryOffset.value) return 1

      const index = Math.ceil((queryOffset.value ?? 0) / (pageSize.value ?? 10)) + 1

      if (index < 1) return 1
      return index
    },
    set(value) {
      pagination.value.pageIndex = value
    }
  })

  /**
  * Pagination state
  */
  const pagination = useState('pagination', () => ({
    pageIndex: pageIndex.value,
    pageSize: pageSize.value
  }))

  function updatePageIndex(newPageIndex: number) {
    pageIndex.value = newPageIndex
    queryOffset.value = (newPageIndex - 1) * pageSize.value || undefined
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
