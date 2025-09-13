import type { QueryParams } from '@hubify/restql'

export function useItems<T extends TableNames>(collection: T) {
  /**
   * Get items
   */
  async function getItems(query?: MaybeRefOrGetter<QueryParams<Schema, T>>) {
    const { data, refresh, status } = await useFetch<{ items: TableItem<T>[], total_count: number }>(`/api/items/${collection}` as `/api/items/:collection`, {
      query
    })

    return {
      items: data.value?.items || [],
      total_count: data.value?.total_count || 0,
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
              $in: ids
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
