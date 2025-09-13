export function useItems<T extends TableNames>(collection: T) {
  /**
   * Get items
   */
  function getItems(where?: MaybeRefOrGetter<Where<T>>) {
    const { data, execute, status } = useFetch<TableItem<T>[]>(`/api/items/${collection}` as `/api/items/:collection`, {
      query: { where },
      immediate: false
    })
    return {
      data,
      status,
      execute
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
