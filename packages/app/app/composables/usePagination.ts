export function usePagination(collection: TableNames) {
  /**
   * Query router parameters
   */
  const { queryLimit, queryOffset } = useQueryRouter(collection)

  /**
  * Page size
  */
  const _pageSize = useLocalStorage(`hubify.collection.${collection}.limit`, 10)

  /**
  * Pagination state
  */
  const pagination = useState('pagination', () => ({
    pageIndex: 1,
    pageSize: toValue(_pageSize || queryLimit) || 10
  }))

  function updatePageIndex(newPageIndex: number) {
    pagination.value.pageIndex = newPageIndex
    queryOffset.value = (newPageIndex - 1) * pagination.value.pageSize
  }

  function updatePageSize(newPageSize: number) {
    pagination.value.pageSize = newPageSize // set new page size
    _pageSize.value = newPageSize // store in localeStorage
    queryLimit.value = newPageSize // set new query limit
    const index = Math.max((Math.ceil((queryOffset.value ?? 0) / (newPageSize ?? 10)) + 1), 1) // recalculate index based on new page size
    updatePageIndex(index)
  }

  /**
   * Init once to set query params
   */
  updatePageIndex(pagination.value.pageIndex)
  updatePageSize(pagination.value.pageSize)

  return {
    pagination,

    updatePageIndex,
    updatePageSize
  }
}
