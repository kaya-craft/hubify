import type { QueryParams } from '@hubify/restql'

export function useItems<T extends TableNames>(collection: T, query?: ComputedRef<QueryParams<Schema, T>>) {
  /**
   * Get items
   */
  const { data, refresh, status } = useFetch<{ items: TableItem<T>[], total_count: number }>(`/api/items/${collection}` as `/api/items/:collection`, {
    query,
    immediate: false
  })

  async function getItems() {
    await refresh()

    return {
      items: computed(() => data.value?.items || []),
      total_count: computed(() => data.value?.total_count || 0),
      status,
      refresh
    }
  }

  /**
   * Delete items
   */
  const { add } = useToast()
  async function deleteItems(ids: MaybeRef<(string | number)[]>) {
    if (!toValue(ids).length) return
    try {
      const response = await $fetch(`/api/items/${collection}` as `/api/items/:collection`, {
        method: 'delete',
        query: {
          where: {
            id: {
              $in: toValue(ids)
            }
          }
        }
      })
      add({
        title: 'Item deleted',
        color: 'success',
        description: 'The item has been successfully deleted.'
      })
      return response
    }
    catch (e) {
      console.log(e)
    }
  }

  return {
    getItems,
    deleteItems
  }
}
